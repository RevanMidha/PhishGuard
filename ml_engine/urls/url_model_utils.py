import re
from math import log2
from urllib.parse import urlparse

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix, hstack
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.metrics import balanced_accuracy_score, f1_score


SUSPICIOUS_TOKENS = [
    "login",
    "verify",
    "secure",
    "account",
    "update",
    "banking",
    "confirm",
    "password",
    "signin",
    "webscr",
    "suspend",
    "urgent",
    "validate",
    "authenticate",
    "free",
    "winner",
    "prize",
    "alert",
]

KNOWN_BRANDS = [
    "paypal",
    "google",
    "facebook",
    "apple",
    "amazon",
    "microsoft",
    "netflix",
    "instagram",
    "twitter",
    "bank",
    "ebay",
    "chase",
    "github",
    "youtube",
    "linkedin",
]

TRUSTED_DOMAINS = {
    "google.com",
    "youtube.com",
    "facebook.com",
    "amazon.com",
    "wikipedia.org",
    "github.com",
    "linkedin.com",
    "microsoft.com",
    "apple.com",
    "stackoverflow.com",
    "ycombinator.com",
    "twitter.com",
    "instagram.com",
    "netflix.com",
    "dropbox.com",
    "zoom.us",
    "paypal.com",
    "chase.com",
    "bankofamerica.com",
    "microsoftonline.com",
    "reddit.com",
    "bing.com",
    "live.com",
    "office.com",
    "yahoo.com",
}

SUSPICIOUS_TLDS = {
    "tk",
    "ru",
    "xyz",
    "top",
    "gq",
    "ml",
    "cf",
    "ga",
    "click",
    "work",
    "support",
    "zip",
    "country",
    "kim",
}

LEET_TRANSLATION = str.maketrans(
    {
        "0": "o",
        "1": "l",
        "3": "e",
        "4": "a",
        "5": "s",
        "7": "t",
        "8": "b",
        "9": "g",
    }
)

URL_PATTERN = re.compile(r"^[a-z0-9\-._~:/?#\[\]@!$&()*+,;=%]+$")


def _safe_parse(url):
    candidate = str(url).strip().lower()
    if not candidate:
        return None
    if not re.match(r"^[a-z]+://", candidate):
        candidate = f"http://{candidate}"
    try:
        return urlparse(candidate)
    except ValueError:
        return None


def canonicalize_url(url):
    candidate = str(url).strip().lower()
    if not candidate:
        return ""

    parsed = _safe_parse(candidate)
    if parsed is None:
        fallback = candidate.replace("http://", "").replace("https://", "")
        fallback = fallback.split("#", 1)[0]
        return fallback.strip()

    host = parsed.netloc or parsed.path.split("/", 1)[0]
    path = parsed.path if parsed.netloc else ""
    query = f"?{parsed.query}" if parsed.query else ""

    host = host.strip().strip("/")
    if not host:
        return ""

    path = re.sub(r"/{2,}", "/", path)
    canonical = f"{host}{path}{query}".strip()
    if not path and not query:
        canonical = f"{canonical}/"
    return canonical


def host_from_url(url):
    canonical = canonicalize_url(url)
    if not canonical:
        return ""
    parsed = _safe_parse(canonical)
    if parsed is not None and parsed.netloc:
        return parsed.netloc
    return canonical.split("/", 1)[0]


def entropy(value):
    if not value:
        return 0.0
    probabilities = [value.count(char) / len(value) for char in set(value)]
    return -sum(prob * log2(prob) for prob in probabilities if prob > 0)


class URLFeatureExtractor(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return np.array([self.extract(url) for url in X])

    def extract(self, url):
        canonical = canonicalize_url(url)
        parsed = _safe_parse(canonical)
        hostname = host_from_url(canonical)
        path = parsed.path if parsed is not None else ""
        query = parsed.query if parsed is not None else ""
        subdomain_count = max(len([part for part in hostname.split(".") if part]) - 2, 0)
        tld = hostname.rsplit(".", 1)[-1] if "." in hostname else ""
        normalized_hostname = hostname.translate(LEET_TRANSLATION)
        host_digit_count = len(re.findall(r"\d", hostname))
        path_digit_count = len(re.findall(r"\d", path))
        host_token_hits = sum(1 for token in SUSPICIOUS_TOKENS if token in hostname)
        path_token_hits = sum(1 for token in SUSPICIOUS_TOKENS if token in path or token in query)
        brand_mismatch_count = sum(
            1
            for brand in KNOWN_BRANDS
            if brand in hostname
            and hostname != f"{brand}.com"
            and not hostname.endswith(f".{brand}.com")
        )
        brand_like_mismatch_count = sum(
            1
            for brand in KNOWN_BRANDS
            if brand in normalized_hostname
            and brand not in hostname
            and hostname != f"{brand}.com"
            and not hostname.endswith(f".{brand}.com")
        )
        suspicious_brand_combo = 1 if brand_mismatch_count > 0 and host_token_hits > 0 else 0
        suspicious_brand_tld_combo = 1 if brand_mismatch_count > 0 and tld in SUSPICIOUS_TLDS else 0
        suspicious_host_shape = 1 if host_token_hits > 0 and "-" in hostname else 0

        return [
            len(canonical),
            len(hostname),
            len(path),
            len(query),
            hostname.count("."),
            hostname.count("-"),
            path.count("/"),
            canonical.count("@"),
            canonical.count("="),
            canonical.count("?"),
            canonical.count("%"),
            len(re.findall(r"\d", canonical)),
            host_digit_count,
            path_digit_count,
            1 if re.search(r"\d+\.\d+\.\d+\.\d+", hostname) else 0,
            1 if "-" in hostname else 0,
            1 if "xn--" in hostname else 0,
            1 if "https" in hostname or "http" in hostname else 0,
            1 if tld in SUSPICIOUS_TLDS else 0,
            subdomain_count,
            host_token_hits,
            path_token_hits,
            brand_mismatch_count,
            brand_like_mismatch_count,
            suspicious_brand_combo,
            suspicious_brand_tld_combo,
            suspicious_host_shape,
            entropy(hostname),
            entropy(path),
            entropy(canonical),
        ]


def build_feature_matrix(urls, tfidf, extractor):
    canonical_urls = [canonicalize_url(url) for url in urls]
    manual_features = csr_matrix(extractor.transform(canonical_urls))
    if tfidf is None:
        return canonical_urls, manual_features

    tfidf_inputs = [host_from_url(url) for url in canonical_urls]
    tfidf_features = tfidf.transform(tfidf_inputs)
    return canonical_urls, hstack([tfidf_features, manual_features])


def heuristic_floor(url):
    canonical = canonicalize_url(url)
    parsed = _safe_parse(canonical)
    hostname = host_from_url(canonical)
    normalized_hostname = hostname.translate(LEET_TRANSLATION)
    path = parsed.path if parsed is not None else ""
    query = parsed.query if parsed is not None else ""
    tld = hostname.rsplit(".", 1)[-1] if "." in hostname else ""

    host_token_hits = sum(1 for token in SUSPICIOUS_TOKENS if token in hostname)
    path_token_hits = sum(1 for token in SUSPICIOUS_TOKENS if token in path or token in query)
    brand_mismatch_count = sum(
        1
        for brand in KNOWN_BRANDS
        if brand in hostname
        and hostname != f"{brand}.com"
        and not hostname.endswith(f".{brand}.com")
    )
    brand_like_mismatch_count = sum(
        1
        for brand in KNOWN_BRANDS
        if brand in normalized_hostname
        and brand not in hostname
        and hostname != f"{brand}.com"
        and not hostname.endswith(f".{brand}.com")
    )
    suspicious_tld = tld in SUSPICIOUS_TLDS

    if brand_like_mismatch_count > 0 and (path_token_hits > 0 or "-" in hostname):
        return 0.92
    if brand_mismatch_count > 0 and suspicious_tld:
        return 0.95
    if brand_mismatch_count > 0 and host_token_hits > 0:
        return 0.90
    if suspicious_tld and (host_token_hits + path_token_hits) >= 2:
        return 0.82
    return 0.0


def is_trusted(url):
    host = host_from_url(url)
    if host in TRUSTED_DOMAINS:
        return True
    for domain in TRUSTED_DOMAINS:
        if host.endswith(f".{domain}"):
            return True
    return False


def predict_url_probabilities(urls, tfidf, extractor, clf):
    canonical_urls, X = build_feature_matrix(urls, tfidf, extractor)
    probabilities = clf.predict_proba(X)[:, 1]
    
    adjusted = []
    for url, probability in zip(canonical_urls, probabilities):
        if is_trusted(url):
            adjusted.append(0.0)
        else:
            adjusted.append(max(probability, heuristic_floor(url)))
            
    return canonical_urls, np.array(adjusted)


def load_url_dataset(path):
    df = pd.read_csv(path).dropna()
    df = df[df["Label"].isin(["good", "bad"])].copy()

    original_rows = len(df)
    df["URL"] = df["URL"].astype(str).map(canonicalize_url)
    df = df[df["URL"].str.len() > 0]
    df = df[df["URL"].str.match(URL_PATTERN, na=False)]

    duplicate_rows = len(df) - len(df.drop_duplicates(["URL", "Label"]))
    df = df.drop_duplicates(["URL", "Label"])

    label_conflicts = df.groupby("URL")["Label"].nunique()
    conflicted_urls = label_conflicts[label_conflicts > 1].index
    conflicting_count = len(conflicted_urls)
    if conflicting_count:
        df = df[~df["URL"].isin(conflicted_urls)].copy()

    return df, {
        "original_rows": original_rows,
        "clean_rows": len(df),
        "duplicate_rows_removed": duplicate_rows,
        "conflicting_urls_removed": conflicting_count,
        "phishing_rows": int((df["Label"] == "bad").sum()),
        "benign_rows": int((df["Label"] == "good").sum()),
        "unique_hosts": int(df["URL"].map(host_from_url).nunique()),
    }


def pick_threshold(y_true, probabilities, min_benign_recall=0.92):
    best_threshold = None
    best_score = (-1.0, -1.0, -1.0)
    fallback_threshold = 0.5
    fallback_score = (-1.0, -1.0, -1.0)

    for threshold in np.arange(0.30, 0.91, 0.01):
        predictions = (probabilities >= threshold).astype(int)
        balanced = balanced_accuracy_score(y_true, predictions)
        macro_f1 = f1_score(y_true, predictions, average="macro", zero_division=0)
        phishing_f1 = f1_score(y_true, predictions, zero_division=0)
        benign_recall = ((predictions == 0) & (y_true == 0)).sum() / max((y_true == 0).sum(), 1)
        fallback_candidate = (balanced, macro_f1, phishing_f1)

        if fallback_candidate > fallback_score or (
            fallback_candidate == fallback_score and threshold > fallback_threshold
        ):
            fallback_threshold = float(round(threshold, 2))
            fallback_score = fallback_candidate

        if benign_recall >= min_benign_recall:
            candidate_score = (phishing_f1, balanced, macro_f1)
            if best_threshold is None or candidate_score > best_score:
                best_threshold = float(round(threshold, 2))
                best_score = candidate_score

    if best_threshold is None:
        return fallback_threshold, {
            "balanced_accuracy": fallback_score[0],
            "macro_f1": fallback_score[1],
            "phishing_f1": fallback_score[2],
            "threshold_strategy": "fallback_balanced_accuracy",
        }

    return best_threshold, {
        "balanced_accuracy": best_score[1],
        "macro_f1": best_score[2],
        "phishing_f1": best_score[0],
        "threshold_strategy": f"benign_recall>={min_benign_recall:.2f}",
    }
