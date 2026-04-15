from __future__ import annotations

import argparse
import hashlib
import io
import re
import sys
import zipfile
from pathlib import Path

import pandas as pd
import requests

from url_model_utils import URL_PATTERN, canonicalize_url, host_from_url


ROOT = Path(__file__).resolve().parents[1]
DATASET_DIR = ROOT / "datasets"
OUTPUT_DATASET = DATASET_DIR / "urls_prepared.csv"
OUTPUT_SUMMARY = DATASET_DIR / "urls_prepared_summary.csv"

PHISHTANK_URL = "https://data.phishtank.com/data/online-valid.csv"
OPENPHISH_URL = "https://openphish.com/feed.txt"
TRANCO_LATEST_URL = "https://tranco-list.eu/latest_list"
USER_AGENT = "PhishGuardDatasetPrep/1.0 (capstone phishing research)"
BENIGN_PATH_TEMPLATES = [
    "/about",
    "/products/books",
    "/docs/getting-started",
    "/support/contact",
    "/blog/company-news",
    "/login",
    "/account/profile",
    "/search?q=help",
    "/pricing",
    "/features",
    "/signup",
    "/team/project",
    "/user/repo",
    "/watch?v=abc123",
]


def fetch_text(url: str) -> str:
    response = requests.get(url, timeout=60, headers={"User-Agent": USER_AGENT})
    response.raise_for_status()
    response.encoding = response.encoding or "utf-8"
    return response.text


def fetch_bytes(url: str) -> bytes:
    response = requests.get(url, timeout=120, headers={"User-Agent": USER_AGENT})
    response.raise_for_status()
    return response.content


def clean_urls(urls: pd.Series) -> pd.Series:
    cleaned = urls.astype(str).map(canonicalize_url)
    cleaned = cleaned[cleaned.str.len() > 0]
    cleaned = cleaned[cleaned.str.match(URL_PATTERN, na=False)]
    return cleaned


def synthesize_benign_urls(domains: pd.Series, variants_per_host: int) -> pd.Series:
    rows = []

    for domain in domains.astype(str):
        rows.append(domain)
        if variants_per_host <= 0:
            continue

        digest = hashlib.sha256(domain.encode("utf-8")).digest()
        start = digest[0] % len(BENIGN_PATH_TEMPLATES)

        for offset in range(variants_per_host):
            template = BENIGN_PATH_TEMPLATES[(start + offset) % len(BENIGN_PATH_TEMPLATES)]
            rows.append(f"{domain}{template}")

    return clean_urls(pd.Series(rows))


def load_phishtank() -> pd.DataFrame:
    raw = fetch_text(PHISHTANK_URL)
    df = pd.read_csv(io.StringIO(raw))
    urls = clean_urls(df["url"])
    out = pd.DataFrame({"URL": urls.unique(), "Label": "bad", "Source": "phishtank"})
    return out


def load_openphish() -> pd.DataFrame:
    raw = fetch_text(OPENPHISH_URL)
    urls = pd.Series([line.strip() for line in raw.splitlines() if line.strip()])
    urls = clean_urls(urls)
    out = pd.DataFrame({"URL": urls.unique(), "Label": "bad", "Source": "openphish"})
    return out


def discover_tranco_csv_url() -> str:
    html = fetch_text(TRANCO_LATEST_URL)
    match = re.search(r'href="(/download/[A-Z0-9]+/1000000)"', html)
    if not match:
        raise RuntimeError("Could not find latest Tranco CSV link")
    return f"https://tranco-list.eu{match.group(1)}"


def load_tranco(limit: int = 200_000, variants_per_host: int = 2) -> pd.DataFrame:
    csv_url = discover_tranco_csv_url()
    payload = fetch_bytes(csv_url)

    try:
        with zipfile.ZipFile(io.BytesIO(payload)) as zf:
            first_member = zf.namelist()[0]
            raw = zf.read(first_member).decode("utf-8")
    except zipfile.BadZipFile:
        raw = payload.decode("utf-8")

    rows = []
    for line in raw.splitlines():
        parts = line.strip().split(",", 1)
        if len(parts) != 2:
            continue
        _, domain = parts
        rows.append(domain.strip())

    urls = clean_urls(pd.Series(rows)).drop_duplicates()
    if limit > 0:
        urls = urls.head(limit)

    urls = synthesize_benign_urls(urls, variants_per_host=variants_per_host).drop_duplicates()
    out = pd.DataFrame({"URL": urls, "Label": "good", "Source": "tranco"})
    return out


def build_dataset(tranco_limit: int = 200_000, benign_variants_per_host: int = 2) -> tuple[pd.DataFrame, pd.DataFrame]:
    phishtank = load_phishtank()
    openphish = load_openphish()
    tranco = load_tranco(limit=tranco_limit, variants_per_host=benign_variants_per_host)

    phishing = pd.concat([phishtank, openphish], ignore_index=True)
    phishing = phishing.drop_duplicates(subset=["URL"]).copy()

    benign = tranco.drop_duplicates(subset=["URL"]).copy()

    conflicting_urls = set(phishing["URL"]) & set(benign["URL"])
    if conflicting_urls:
        benign = benign[~benign["URL"].isin(conflicting_urls)].copy()

    dataset = pd.concat([phishing, benign], ignore_index=True)
    dataset["Host"] = dataset["URL"].map(host_from_url)
    dataset = dataset.drop_duplicates(subset=["URL", "Label"]).copy()

    summary = (
        dataset.groupby(["Label", "Source"])
        .agg(rows=("URL", "count"), unique_hosts=("Host", "nunique"))
        .reset_index()
        .sort_values(["Label", "Source"])
    )

    return dataset[["URL", "Label", "Source"]], summary


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download phishing and benign feeds and prepare a clean URL dataset."
    )
    parser.add_argument(
        "--tranco-limit",
        type=int,
        default=200_000,
        help="Maximum number of benign Tranco domains to keep. Use 0 for the full list.",
    )
    parser.add_argument(
        "--benign-path-variants",
        type=int,
        default=2,
        help="How many deterministic benign path variants to synthesize per Tranco host.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    dataset, summary = build_dataset(
        tranco_limit=args.tranco_limit,
        benign_variants_per_host=max(args.benign_path_variants, 0),
    )

    dataset.to_csv(OUTPUT_DATASET, index=False)
    summary.to_csv(OUTPUT_SUMMARY, index=False)

    print(f"Saved prepared dataset to: {OUTPUT_DATASET}")
    print(f"Saved summary to: {OUTPUT_SUMMARY}")
    print(f"Tranco limit used: {args.tranco_limit}")
    print(f"Benign path variants per host: {max(args.benign_path_variants, 0)}")
    print("\nSummary")
    print(summary.to_string(index=False))
    print("\nLabel counts")
    print(dataset["Label"].value_counts().to_string())
    return 0


if __name__ == "__main__":
    sys.exit(main())
