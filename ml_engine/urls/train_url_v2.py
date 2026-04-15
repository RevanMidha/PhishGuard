from pathlib import Path

import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import GroupShuffleSplit
from sklearn.feature_extraction.text import TfidfVectorizer

from url_model_utils import (
    URLFeatureExtractor,
    build_feature_matrix,
    host_from_url,
    load_url_dataset,
    pick_threshold,
    predict_url_probabilities,
)


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET_PATH = ROOT / "datasets" / "urls_prepared.csv"
FALLBACK_DATASET_PATH = ROOT / "datasets" / "urls.csv"
MODEL_PATH = "url_model_v2.pkl"


def print_report(title, y_true, probabilities, threshold):
    predictions = (probabilities >= threshold).astype(int)
    print(f"\n{title} (threshold={threshold:.2f})")
    print(classification_report(y_true, predictions, target_names=["Benign", "Phishing"]))


def main():
    dataset_path = DEFAULT_DATASET_PATH if DEFAULT_DATASET_PATH.exists() else FALLBACK_DATASET_PATH
    print(f"Using dataset: {dataset_path}")

    df, stats = load_url_dataset(dataset_path)
    groups = df["URL"].map(host_from_url)
    y = (df["Label"] == "bad").astype(int)

    print("Dataset summary")
    for key, value in stats.items():
        print(f"  {key}: {value}")

    outer_split = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    train_val_idx, test_idx = next(outer_split.split(df["URL"], y, groups))

    train_val_urls = df["URL"].iloc[train_val_idx].reset_index(drop=True)
    train_val_y = y.iloc[train_val_idx].reset_index(drop=True)
    train_val_groups = groups.iloc[train_val_idx].reset_index(drop=True)

    test_urls = df["URL"].iloc[test_idx].reset_index(drop=True)
    test_y = y.iloc[test_idx].reset_index(drop=True)

    inner_split = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=43)
    train_idx, val_idx = next(inner_split.split(train_val_urls, train_val_y, train_val_groups))

    train_urls = train_val_urls.iloc[train_idx].reset_index(drop=True)
    train_y = train_val_y.iloc[train_idx].reset_index(drop=True)
    val_urls = train_val_urls.iloc[val_idx].reset_index(drop=True)
    val_y = train_val_y.iloc[val_idx].reset_index(drop=True)

    print("\nSplit summary")
    print(f"  train rows: {len(train_urls)}")
    print(f"  val rows: {len(val_urls)}")
    print(f"  test rows: {len(test_urls)}")
    print(f"  train hosts: {train_urls.map(host_from_url).nunique()}")
    print(f"  val hosts: {val_urls.map(host_from_url).nunique()}")
    print(f"  test hosts: {test_urls.map(host_from_url).nunique()}")

    extractor = URLFeatureExtractor()
    tfidf = TfidfVectorizer(
        analyzer="char",
        ngram_range=(3, 5),
        min_df=5,
        lowercase=False,
        sublinear_tf=True,
    )

    print("\nBuilding hostname TF-IDF + lexical feature matrices...")
    tfidf.fit(train_urls.map(host_from_url))
    train_urls, X_train = build_feature_matrix(train_urls, tfidf, extractor)
    val_urls, X_val = build_feature_matrix(val_urls, tfidf, extractor)
    test_urls, X_test = build_feature_matrix(test_urls, tfidf, extractor)

    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import MaxAbsScaler

    clf = Pipeline([
        ('scaler', MaxAbsScaler()),
        ('lr', LogisticRegression(
            solver="lbfgs",
            max_iter=2500,
            class_weight="balanced",
            random_state=42,
        ))
    ])

    print("Training scaled phishing classifier...")
    clf.fit(X_train, train_y)

    val_prob = clf.predict_proba(X_val)[:, 1]
    threshold, threshold_metrics = pick_threshold(val_y, val_prob)

    print("\nValidation threshold search")
    for key, value in threshold_metrics.items():
        if isinstance(value, float):
            print(f"  {key}: {value:.4f}")
        else:
            print(f"  {key}: {value}")

    print_report("Validation report", val_y, val_prob, threshold)

    test_prob = clf.predict_proba(X_test)[:, 1]
    print_report("Test report", test_y, test_prob, threshold)

    sanity_urls = [
        "google.com",
        "https://google.com",
        "github.com/user/repo",
        "https://github.com/user/repo",
        "amazon.com/products/books",
        "paypal-secure-login.verify-account.com/cmd=login",
        "amazon-account-update.tk/signin/verify?user=admin",
        "secure.apple.com.phishing-site.ru/id/login?suspended=true",
    ]
    _, sanity_prob = predict_url_probabilities(sanity_urls, tfidf, extractor, clf)

    print("\nSanity check")
    for url, probability in zip(sanity_urls, sanity_prob):
        label = "PHISHING" if probability >= threshold else "SAFE"
        print(f"  {url:<65} {probability:>7.2%}  {label}")

    joblib.dump((tfidf, extractor, clf, threshold), MODEL_PATH)
    print(f"\nSaved {MODEL_PATH} with threshold={threshold:.2f}")


if __name__ == "__main__":
    main()
