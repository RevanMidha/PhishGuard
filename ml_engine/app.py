"""
PhishGuard ML Engine
--------------------
A Flask microservice that exposes three ML-powered scan endpoints:
  - /api/scan/url    : Detects phishing URLs using a trained TF-IDF + classifier pipeline
  - /api/scan/text   : Detects phishing in emails/messages using an NLP model
  - /api/scan/vision : Detects phishing via OCR analysis of webpage screenshots

Runs on port 5001 to avoid conflict with the Node.js backend on port 5000.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from functools import lru_cache
import sys
import os

# ---------------------------------------------------------------------------
# Path Setup
# ---------------------------------------------------------------------------
# Add submodule directories to sys.path so joblib can correctly unpickle
# custom classes defined inside these modules (e.g. feature extractors).
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'urls'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'emails'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'vision'))

# ---------------------------------------------------------------------------
# Module Imports
# ---------------------------------------------------------------------------
from emails.text_scanner import analyze_text_message       # NLP-based email/text analysis
from urls.url_model_utils import predict_url_probabilities  # URL feature extraction + prediction
from vision.vision_scanner import analyze_screenshot        # OCR + visual clone detection

# ---------------------------------------------------------------------------
# App Initialization
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the React frontend / Node backend

# ---------------------------------------------------------------------------
# Model Paths
# ---------------------------------------------------------------------------
# Trained model files are stored relative to the ml_engine directory.
URL_MODEL_PATH = "urls/url_model_v2.pkl"    # Packed as (tfidf, extractor, clf, threshold)
TEXT_MODEL_PATH = "emails/text_model.pkl"   # Packed as (model, threshold)

# ---------------------------------------------------------------------------
# Model Loading
# ---------------------------------------------------------------------------
# Models are loaded once at startup into memory to avoid per-request disk I/O.
print("=" * 50)
print("Initializing PhishGuard ML Engine...")
print("=" * 50)

try:
    print("Loading URL Analysis Models...")
    # Unpack: TF-IDF vectorizer, feature extractor, classifier, decision threshold
    tfidf, extractor, clf, threshold = joblib.load(URL_MODEL_PATH)

    print("Loading Lexical & Semantic Text Models...")
    # Unpack: trained text classifier, decision threshold
    text_model, text_threshold = joblib.load(TEXT_MODEL_PATH)
    print("All Models Loaded Successfully into Memory.")
except Exception as e:
    # Gracefully fall back so the server still starts; endpoints will error at call time
    text_model = None
    text_threshold = 0.4
    print(f"Error loading models. Have you run the training scripts? Exception: {e}")

# ---------------------------------------------------------------------------
# Caching Helpers
# ---------------------------------------------------------------------------
# lru_cache avoids re-running expensive ML inference for repeated identical inputs.
# maxsize=1024 keeps the last 1024 unique inputs cached in memory.

@lru_cache(maxsize=1024)
def cached_scan_url(url):
    """Run URL inference and cache the result keyed by the raw URL string."""
    canonical_urls, probabilities = predict_url_probabilities([url], tfidf, extractor, clf)
    probability = probabilities[0]
    result = "malicious" if probability >= threshold else "safe"
    return {
        "url": url,
        "canonical_url": canonical_urls[0],  # Normalized/decoded form of the URL
        "result": result,
        "confidence_score": float(probability),
        "threshold_used": float(threshold)
    }

@lru_cache(maxsize=1024)
def cached_scan_text(text):
    """Run text/email inference and cache the result keyed by the raw text string."""
    return analyze_text_message(text, model=text_model, model_threshold=text_threshold)

# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@app.route('/api/scan/url', methods=['POST'])
def scan_url():
    """
    POST /api/scan/url
    Body: { "url": "https://example.com" }
    Returns: result, confidence_score, threshold_used, canonical_url
    """
    data = request.json
    url = data.get("url")

    # Validate input — reject empty or missing URL
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        return jsonify(cached_scan_url(url))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/scan/text', methods=['POST'])
def scan_text():
    """
    POST /api/scan/text
    Body: { "text": "Your account has been suspended..." }
    Returns: result, confidence_score, indicators (list of detected signals)
    """
    data = request.json
    text = data.get("text")

    # Validate input — reject empty or missing text body
    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        return jsonify(cached_scan_text(text))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/scan/vision', methods=['POST'])
def scan_vision():
    """
    POST /api/scan/vision
    Body: { "imageData": "<base64 encoded screenshot>", "url": "https://..." }
    Returns: result, confidence_score, ocr_text, indicators
    Vision scanner uses Tesseract OCR + heuristic visual clone detection.
    """
    data = request.json
    image_data = data.get("imageData")
    url = data.get("url")

    # Validate input — image data is required; URL is optional context
    if not image_data:
        return jsonify({"error": "No image data provided"}), 400

    try:
        return jsonify(analyze_screenshot(image_data=image_data, url=url))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    # Run on port 5001 so it doesn't conflict with Node.js on port 5000
    app.run(host='0.0.0.0', port=5001, debug=False)
