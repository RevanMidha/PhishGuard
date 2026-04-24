from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from functools import lru_cache

from emails.text_scanner import analyze_text_message
from urls.url_model_utils import predict_url_probabilities
from vision.vision_scanner import analyze_screenshot

app = Flask(__name__)
CORS(app)

URL_MODEL_PATH = "urls/url_model_v2.pkl"
TEXT_MODEL_PATH = "emails/text_model.pkl"

print("=" * 50)
print("Initializing PhishGuard ML Engine...")
print("=" * 50)

try:
    print("Loading URL Analysis Models...")
    tfidf, extractor, clf, threshold = joblib.load(URL_MODEL_PATH)
    
    print("Loading Lexical & Semantic Text Models...")
    text_model, text_threshold = joblib.load(TEXT_MODEL_PATH)
    print("All Models Loaded Successfully into Memory.")
except Exception as e:
    text_model = None
    text_threshold = 0.4
    print(f"Error loading models. Have you run the training scripts? Exception: {e}")

@lru_cache(maxsize=1024)
def cached_scan_url(url):
    canonical_urls, probabilities = predict_url_probabilities([url], tfidf, extractor, clf)
    probability = probabilities[0]
    result = "malicious" if probability >= threshold else "safe"
    return {
        "url": url,
        "canonical_url": canonical_urls[0],
        "result": result,
        "confidence_score": float(probability),
        "threshold_used": float(threshold)
    }

@lru_cache(maxsize=1024)
def cached_scan_text(text):
    return analyze_text_message(text, model=text_model, model_threshold=text_threshold)

@app.route('/api/scan/url', methods=['POST'])
def scan_url():
    data = request.json
    url = data.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400
    
    try:
        return jsonify(cached_scan_url(url))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scan/text', methods=['POST'])
def scan_text():
    data = request.json
    text = data.get("text")
    if not text:
        return jsonify({"error": "No text provided"}), 400
        
    try:
        return jsonify(cached_scan_text(text))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/scan/vision', methods=['POST'])
def scan_vision():
    data = request.json
    image_data = data.get("imageData")
    url = data.get("url")

    if not image_data:
        return jsonify({"error": "No image data provided"}), 400

    try:
        return jsonify(analyze_screenshot(image_data=image_data, url=url))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run on port 5001 so it doesn't conflict with Node.js on port 5000
    app.run(port=5001, debug=False)
