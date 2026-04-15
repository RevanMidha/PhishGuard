import joblib

from urls.url_model_utils import predict_url_probabilities


URL_MODEL_PATH = "urls/url_model_v2.pkl"
TEXT_MODEL_PATH = "emails/text_model.pkl"


def scan_url(url, tfidf, extractor, clf, threshold):
    canonical_urls, probabilities = predict_url_probabilities([url], tfidf, extractor, clf)
    probability = probabilities[0]
    result = "PHISHING" if probability >= threshold else "SAFE"

    print(f"  URL: {url}")
    print(f"  Canonical: {canonical_urls[0]}")
    print(f"  Result: {result} | Confidence: {probability * 100:.1f}%\n")


def scan_text(text, text_model, text_threshold, label=""):
    probability = text_model.predict_proba([text])[0][1]
    result = "PHISHING" if probability >= text_threshold else "SAFE"
    print(f"  Email: {label}")
    print(f"  Result: {result} | Confidence: {probability * 100:.1f}%\n")


def main():
    tfidf, extractor, clf, threshold = joblib.load(URL_MODEL_PATH)
    text_model, text_threshold = joblib.load(TEXT_MODEL_PATH)

    print("=" * 60)
    print("URL SCANNER TESTS")
    print("=" * 60)

    print("\nSAFE URLs:")
    scan_url("google.com", tfidf, extractor, clf, threshold)
    scan_url("https://www.youtube.com/watch?v=abc123", tfidf, extractor, clf, threshold)
    scan_url("https://github.com/user/repo", tfidf, extractor, clf, threshold)
    scan_url("https://www.amazon.com/products/books", tfidf, extractor, clf, threshold)

    print("PHISHING URLs:")
    scan_url("http://paypal-secure-login.verify-account.com/cmd=login", tfidf, extractor, clf, threshold)
    scan_url("http://192.168.1.1/banking/confirm-password.php", tfidf, extractor, clf, threshold)
    scan_url("http://amazon-account-update.tk/signin/verify?user=admin", tfidf, extractor, clf, threshold)
    scan_url("http://secure.apple.com.phishing-site.ru/id/login?suspended=true", tfidf, extractor, clf, threshold)

    print("=" * 60)
    print("EMAIL TEXT SCANNER TESTS")
    print("=" * 60)

    print("\nSAFE Emails:")
    scan_text(
        """
Hi John, just wanted to follow up on our meeting yesterday.
Please find the project report attached. Let me know if you
have any questions. Best regards, Sarah.
""",
        text_model,
        text_threshold,
        "Normal work email",
    )

    scan_text(
        """
Your Amazon order #112-3456789 has been shipped!
Expected delivery: April 15. Track your package at amazon.com.
""",
        text_model,
        text_threshold,
        "Legitimate Amazon order",
    )

    print("PHISHING Emails:")
    scan_text(
        """
URGENT: Your account has been suspended due to unusual activity.
You must verify your identity immediately or your account will
be permanently deleted. Click here to confirm your password
and banking details: http://paypal-verify.tk/login
""",
        text_model,
        text_threshold,
        "Fake PayPal suspension",
    )

    scan_text(
        """
Congratulations! You have been selected as our lucky winner.
To claim your prize of $1,000,000 you must provide your
credit card details and social security number immediately.
Act now - this offer expires in 24 hours!
""",
        text_model,
        text_threshold,
        "Prize scam email",
    )

    scan_text(
        """
Dear valued customer, your Netflix account will be suspended.
Please update your payment information immediately to avoid
losing access. Click the link below and enter your credentials.
""",
        text_model,
        text_threshold,
        "Fake Netflix email",
    )


if __name__ == "__main__":
    main()
