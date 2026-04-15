# URL Dataset Guide

## Recommended Sources

- `PhishTank`: good for verified phishing URLs and hourly downloadable feeds.
- `OpenPhish`: good for live phishing URLs; the community feed is free and the academic program is useful for capstone work.
- `Tranco`: best default benign seed list for research because it is reproducible and designed for security studies.
- `Cisco Umbrella Top 1M`: useful as an extra benign pool, but treat it as a supplement rather than a gold-standard clean list.

## What To Avoid

- Mixed "malicious URL" corpora when your goal is specifically phishing detection.
- Datasets that label compromised but legitimate platforms as if the base domain itself were phishing.
- Random train/test row splits when the same host family appears in both sets.
- Metrics reported without a separate real-world benchmark.

## Suggested Training Recipe

1. Positive class:
   Use recent `PhishTank` and `OpenPhish` URLs.

2. Negative class:
   Start from `Tranco`, then sample real navigational paths from those domains if possible.

3. Cleaning:
   Normalize URLs the same way for training and inference.
   Drop duplicate rows and remove URLs with conflicting labels.
   Group splits by host so the model cannot memorize domains.

4. Evaluation:
   Keep a hand-labeled benchmark of real URLs you care about.
   Tune the threshold based on false-positive tolerance, not raw accuracy alone.

## Practical Goal

For a capstone phishing detector, a smaller but cleaner dataset is usually better than a giant mixed feed with noisy labels.

## Repo Workflow

Refresh the prepared dataset:

```bash
python ml_engine/urls/prepare_url_dataset.py
```

Use a bigger benign pool if you want:

```bash
python ml_engine/urls/prepare_url_dataset.py --tranco-limit 300000
```

The default prep also synthesizes `2` benign path variants per Tranco host so the model sees normal URLs beyond bare homepages.

Then retrain the detector:

```bash
cd ml_engine/urls
python train_url_v2.py
```

As of 13 April 2026, the prepared dataset in this repo contains:

- `56,119` phishing URLs from `PhishTank` and `OpenPhish`
- `599,992` benign URLs from `Tranco` after adding deterministic safe path variants
