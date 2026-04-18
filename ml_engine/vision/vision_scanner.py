import base64
import binascii
import os
import re
from io import BytesIO
from urllib.parse import urlparse

import cv2
import numpy as np
import pytesseract
from PIL import Image


DEFAULT_TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(DEFAULT_TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = DEFAULT_TESSERACT_PATH


BRAND_KEYWORDS = {
    "paypal": {
        "aliases": ["paypal"],
        "domains": ["paypal.com"],
    },
    "google": {
        "aliases": ["google", "gmail", "google workspace"],
        "domains": ["google.com", "accounts.google.com"],
    },
    "facebook": {
        "aliases": ["facebook", "meta"],
        "domains": ["facebook.com", "fb.com"],
    },
    "apple": {
        "aliases": ["apple", "icloud", "apple id"],
        "domains": ["apple.com", "icloud.com"],
    },
    "amazon": {
        "aliases": ["amazon", "prime"],
        "domains": ["amazon.com"],
    },
    "microsoft": {
        "aliases": ["microsoft", "office 365", "outlook", "onedrive", "azure"],
        "domains": ["microsoft.com", "outlook.com", "live.com", "office.com"],
    },
    "netflix": {
        "aliases": ["netflix"],
        "domains": ["netflix.com"],
    },
    "instagram": {
        "aliases": ["instagram"],
        "domains": ["instagram.com"],
    },
    "twitter": {
        "aliases": ["twitter", "x"],
        "domains": ["twitter.com", "x.com"],
    },
    "chase": {
        "aliases": ["chase", "jpmorgan chase"],
        "domains": ["chase.com"],
    },
    "bankofamerica": {
        "aliases": ["bank of america", "boa"],
        "domains": ["bankofamerica.com"],
    },
}

KEYWORD_GROUPS = {
    "login": {
        "weight": 2.0,
        "label": "Credential harvesting flow",
        "detail": "The screenshot appears to request credentials or sign-in details.",
        "patterns": [
            r"\blog ?in\b",
            r"\bsign ?in\b",
            r"\bpassword\b",
            r"\busername\b",
            r"\bemail address\b",
            r"\btwo[- ]step verification\b",
            r"\botp\b",
            r"\bverification code\b",
        ],
    },
    "payment": {
        "weight": 2.2,
        "label": "Payment collection flow",
        "detail": "The page requests billing or card information.",
        "patterns": [
            r"\bcredit card\b",
            r"\bdebit card\b",
            r"\bcard number\b",
            r"\bcvv\b",
            r"\bexpiry\b",
            r"\bbilling\b",
            r"\bpayment\b",
            r"\bwallet\b",
        ],
    },
    "urgency": {
        "weight": 1.6,
        "label": "Urgency wording",
        "detail": "The visible text pressures the user to act immediately.",
        "patterns": [
            r"\burgent\b",
            r"\bimmediately\b",
            r"\bact now\b",
            r"\bwithin \d+ (?:minute|minutes|hour|hours|day|days)\b",
            r"\bfinal warning\b",
            r"\bexpires?\b",
            r"\bdeadline\b",
        ],
    },
    "threat": {
        "weight": 2.0,
        "label": "Threat or penalty",
        "detail": "The page threatens suspension, loss, or security issues to provoke action.",
        "patterns": [
            r"\bsuspended\b",
            r"\blocked\b",
            r"\bdisabled\b",
            r"\bunusual activity\b",
            r"\bsecurity alert\b",
            r"\bunauthorized\b",
            r"\bcompromised\b",
        ],
    },
}

DOMAIN_PATTERN = re.compile(r"\b(?:https?://)?(?:www\.)?(?:(?:[a-z0-9-]+\.)+[a-z]{2,})\b", re.IGNORECASE)


def _indicator(label, detail, severity):
    return {"label": label, "detail": detail, "severity": severity}


def _normalize_host(url):
    if not url:
        return None

    candidate = url.strip()
    if "://" not in candidate:
        candidate = f"https://{candidate}"

    parsed = urlparse(candidate)
    host = parsed.netloc.lower()
    if not host:
        return None
    if host.startswith("www."):
        host = host[4:]
    return host


def _domain_matches(host, allowed_domains):
    if not host:
        return False
    return any(host == domain or host.endswith(f".{domain}") for domain in allowed_domains)


def _load_image_from_path(image_path):
    return Image.open(image_path).convert("RGB")


def _load_image_from_base64(image_data):
    payload = image_data.split(",", 1)[1] if "," in image_data else image_data
    try:
        decoded = base64.b64decode(payload)
    except (ValueError, binascii.Error) as exc:
        raise ValueError("Image payload is not valid base64 data.") from exc

    return Image.open(BytesIO(decoded)).convert("RGB")


def _ocr_text(image):
    text = pytesseract.image_to_string(image)
    return re.sub(r"\s+", " ", text).strip()


def _extract_shape_features(image):
    cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    input_like_boxes = 0
    button_like_boxes = 0
    image_height, image_width = gray.shape[:2]
    min_width = image_width * 0.25

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h
        if area < 1500 or w < min_width:
            continue

        aspect_ratio = w / max(h, 1)
        if 2.3 <= aspect_ratio <= 18 and 18 <= h <= 90:
            input_like_boxes += 1
            if 2.0 <= aspect_ratio <= 7.5:
                button_like_boxes += 1

    return {
        "input_field_candidates": min(input_like_boxes, 8),
        "button_candidates": min(button_like_boxes, 6),
    }


def _count_alias_occurrences(normalized_text, alias):
    return len(re.findall(rf"\b{re.escape(alias)}\b", normalized_text))


def _detect_brand(normalized_text, host=None, visible_domains=None):
    brand_scores = {}
    visible_domains = visible_domains or []

    for brand, meta in BRAND_KEYWORDS.items():
        score = 0.0
        for alias in meta["aliases"]:
            alias_hits = _count_alias_occurrences(normalized_text, alias)
            if alias_hits == 0:
                continue

            alias_weight = 0.6 if alias == "meta" else 1.0
            if alias == brand:
                alias_weight += 0.4
            score += alias_hits * alias_weight

        if host and _domain_matches(host, meta["domains"]):
            score += 4.0

        domain_mentions = sum(1 for domain in visible_domains if _domain_matches(domain, meta["domains"]))
        if domain_mentions:
            score += domain_mentions * 2.5

        if score > 0:
            brand_scores[brand] = score

    if not brand_scores:
        return None

    return max(brand_scores, key=brand_scores.get)


def _find_pattern_matches(normalized_text, patterns):
    matches = []
    for pattern in patterns:
        found = re.findall(pattern, normalized_text)
        for item in found:
            if isinstance(item, tuple):
                value = " ".join(part for part in item if part).strip()
            else:
                value = item.strip()
            if value:
                matches.append(value)
    return sorted(set(matches))


def _summarize_verdict(result, detected_brand, host):
    if result == "malicious":
        if detected_brand and host:
            return f"The screenshot looks like a {detected_brand} page, but the supplied domain does not match that brand."
        if detected_brand:
            return f"The screenshot strongly resembles a {detected_brand} login or payment flow and shows multiple phishing indicators."
        return "The screenshot shows several phishing-style visual and textual signals."
    if result == "suspicious":
        return "The screenshot contains enough risky cues to warrant manual verification before trusting it."
    return "No strong phishing indicators were found in the visible screenshot content."


def analyze_screenshot(image_path=None, url=None, image_data=None):
    try:
        if image_data:
            image = _load_image_from_base64(image_data)
        elif image_path:
            image = _load_image_from_path(image_path)
        else:
            raise ValueError("An image path or image data payload is required.")
    except Exception as exc:
        return {
            "result": "error",
            "confidence_score": 0.0,
            "risk_score": 0.0,
            "summary": f"Could not process image: {str(exc)}",
            "indicators": [],
        }

    try:
        text = _ocr_text(image)
    except Exception as exc:
        return {
            "result": "error",
            "confidence_score": 0.0,
            "risk_score": 0.0,
            "summary": f"OCR failed while reading the screenshot: {str(exc)}",
            "indicators": [],
        }

    normalized_text = text.lower()
    host = _normalize_host(url)
    visible_domains = sorted(set(match.lower() for match in DOMAIN_PATTERN.findall(normalized_text)))
    indicators = []
    risk_score = 0.0
    shape_features = _extract_shape_features(image)
    detected_brand = _detect_brand(normalized_text, host=host, visible_domains=visible_domains)

    if detected_brand:
        indicators.append(
            _indicator(
                "Recognized brand",
                f"The screenshot references {detected_brand}, so domain alignment matters more here.",
                "medium",
            )
        )

    for group in KEYWORD_GROUPS.values():
        matches = _find_pattern_matches(normalized_text, group["patterns"])
        if matches:
            risk_score += group["weight"]
            severity = "high" if group["weight"] >= 2 else "medium"
            indicators.append(
                _indicator(
                    group["label"],
                    f"{group['detail']} Matches: {', '.join(matches[:4])}.",
                    severity,
                )
            )

    if shape_features["input_field_candidates"] >= 2:
        risk_score += 1.4
        indicators.append(
            _indicator(
                "Detected form fields",
                f"The layout contains {shape_features['input_field_candidates']} input-like regions, which suggests a login or collection form.",
                "medium",
            )
        )

    if shape_features["button_candidates"] >= 1:
        risk_score += 0.6

    if detected_brand and host:
        allowed_domains = BRAND_KEYWORDS[detected_brand]["domains"]
        if _domain_matches(host, allowed_domains):
            risk_score = max(0.0, risk_score - 1.6)
            indicators.append(
                _indicator(
                    "Domain matches brand",
                    f"The supplied domain `{host}` aligns with the detected {detected_brand} brand.",
                    "low",
                )
            )
        else:
            risk_score += 3.0
            indicators.append(
                _indicator(
                    "Brand/domain mismatch",
                    f"The screenshot looks like {detected_brand}, but the supplied domain `{host}` is not one of its known domains.",
                    "high",
                )
            )
    elif detected_brand and not host:
        risk_score += 1.3
        indicators.append(
            _indicator(
                "Brand shown without URL context",
                "The screenshot resembles a branded page, but no URL was supplied for validation.",
                "medium",
            )
        )

    if visible_domains and detected_brand:
        allowed_domains = BRAND_KEYWORDS[detected_brand]["domains"]
        mismatched_visible_domains = [
            domain for domain in visible_domains if not _domain_matches(domain, allowed_domains)
        ]
        if mismatched_visible_domains:
            risk_score += 1.5
            indicators.append(
                _indicator(
                    "Suspicious visible domain",
                    f"The screenshot text mentions domains that do not match the detected brand: {', '.join(mismatched_visible_domains[:3])}.",
                    "high",
                )
            )

    text_length = len(normalized_text)
    if text_length == 0 and shape_features["input_field_candidates"] == 0:
        risk_score = max(0.0, risk_score - 0.5)

    normalized_risk = min(0.98, risk_score / 9.0)
    high_severity_count = sum(1 for item in indicators if item["severity"] == "high")

    if normalized_risk >= 0.72 or high_severity_count >= 2:
        result = "malicious"
        confidence = max(0.74, normalized_risk)
    elif normalized_risk >= 0.42 or high_severity_count == 1:
        result = "suspicious"
        confidence = max(0.58, normalized_risk)
    else:
        result = "safe"
        confidence = max(0.78, 1 - normalized_risk)

    if not indicators:
        indicators = [
            _indicator(
                "No risky visual cues found",
                "No strong brand spoofing, login collection, payment collection, or urgency signals were detected.",
                "low",
            )
        ]

    return {
        "result": result,
        "confidence_score": float(round(confidence, 4)),
        "risk_score": float(round(normalized_risk, 4)),
        "summary": _summarize_verdict(result, detected_brand, host),
        "indicators": indicators[:6],
        "detected_brand": detected_brand,
        "supplied_domain": host,
        "visual_features": shape_features,
        "extracted_text_preview": text[:240],
    }


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python vision_scanner.py <image_path> [url]")
        sys.exit(1)

    image_path = sys.argv[1]
    url = sys.argv[2] if len(sys.argv) > 2 else None
    result = analyze_screenshot(image_path=image_path, url=url)

    print(f"\nResult:     {result['result'].upper()}")
    print(f"Confidence: {result['confidence_score']:.0%}")
    print(f"Risk:       {result['risk_score']:.0%}")
    print(f"Summary:    {result['summary']}")
