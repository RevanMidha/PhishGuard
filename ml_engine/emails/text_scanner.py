import re
from typing import Any, Dict, List, Optional


SAFE_CONVERSATIONAL_PATTERNS = [
    r"\bhi\b",
    r"\bhello\b",
    r"\bhey\b",
    r"\bgood (morning|afternoon|evening)\b",
    r"\bmy name is\b",
    r"\bnice to meet you\b",
    r"\bhow are you\b",
    r"\bthank(s| you)\b",
    r"\bsee you\b",
    r"\blet('?s| us) (talk|meet|chat)\b",
]

SUSPICIOUS_GROUPS = {
    "urgency": {
        "weight": 1.7,
        "label": "Urgency pressure",
        "detail": "The message pushes for immediate action or uses a countdown.",
        "patterns": [
            r"\burgent\b",
            r"\bimmediately\b",
            r"\bact now\b",
            r"\bwithin \d+ (?:hour|hours|minute|minutes|day|days)\b",
            r"\btoday\b",
            r"\bfinal warning\b",
            r"\bexpires?\b",
            r"\bdeadline\b",
        ],
    },
    "account_threat": {
        "weight": 2.1,
        "label": "Account threat",
        "detail": "The text threatens suspension, locks, or unusual activity to pressure the recipient.",
        "patterns": [
            r"\bsuspend(?:ed|ing)?\b",
            r"\blocked\b",
            r"\bdisabled\b",
            r"\bdeactivated\b",
            r"\bunusual activity\b",
            r"\bsecurity alert\b",
            r"\baccount (issue|problem|risk)\b",
            r"\bunauthorized\b",
        ],
    },
    "credential_request": {
        "weight": 2.5,
        "label": "Credential request",
        "detail": "The message asks for passwords, verification codes, or account confirmation.",
        "patterns": [
            r"\bverify (?:your )?(?:account|identity|email|login)\b",
            r"\bconfirm (?:your )?(?:account|identity|password|details)\b",
            r"\breset (?:your )?password\b",
            r"\blog ?in\b",
            r"\bsign ?in\b",
            r"\bpassword\b",
            r"\botp\b",
            r"\bone[- ]time (?:code|password)\b",
            r"\bsecurity code\b",
        ],
    },
    "financial_request": {
        "weight": 2.4,
        "label": "Sensitive payment request",
        "detail": "The message requests payment information or money movement.",
        "patterns": [
            r"\bbank account\b",
            r"\bcredit card\b",
            r"\bdebit card\b",
            r"\bcvv\b",
            r"\bpayment\b",
            r"\brefund\b",
            r"\binvoice\b",
            r"\bwire transfer\b",
            r"\bgift card\b",
            r"\bcrypto\b",
        ],
    },
    "action_request": {
        "weight": 1.5,
        "label": "Action prompt",
        "detail": "The sender is pushing the recipient to click, open, download, or call.",
        "patterns": [
            r"\bclick\b",
            r"\bopen (?:the )?attachment\b",
            r"\bdownload\b",
            r"\bvisit (?:the )?(?:link|site|website)\b",
            r"\btap (?:the )?link\b",
            r"\bscan (?:the )?qr\b",
            r"\bcall now\b",
        ],
    },
    "impersonation": {
        "weight": 1.3,
        "label": "Brand impersonation cue",
        "detail": "A well-known service or institution is referenced in a risky context.",
        "patterns": [
            r"\bpaypal\b",
            r"\bgoogle\b",
            r"\bmicrosoft\b",
            r"\bapple\b",
            r"\bamazon\b",
            r"\bnetflix\b",
            r"\bbank\b",
            r"\bhr\b",
            r"\bit support\b",
        ],
    },
    "reward_lure": {
        "weight": 1.6,
        "label": "Reward lure",
        "detail": "The message uses prizes or exclusive offers to attract clicks.",
        "patterns": [
            r"\byou(?:'ve| have) won\b",
            r"\bprize\b",
            r"\breward\b",
            r"\bfree gift\b",
            r"\bclaim now\b",
        ],
    },
}

URL_PATTERN = re.compile(r"(https?://\S+|www\.\S+)", re.IGNORECASE)
EMAIL_PATTERN = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
SHORTENER_PATTERN = re.compile(
    r"\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|rb\.gy|cutt\.ly)\b",
    re.IGNORECASE,
)
IP_URL_PATTERN = re.compile(r"https?://\d{1,3}(?:\.\d{1,3}){3}", re.IGNORECASE)


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _count_all_caps_words(text: str) -> int:
    return sum(1 for token in re.findall(r"\b[A-Z]{3,}\b", text) if token.isupper())


def _find_group_matches(normalized_text: str, patterns: List[str]) -> List[str]:
    matches: List[str] = []
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


def _indicator(label: str, detail: str, severity: str) -> Dict[str, str]:
    return {"label": label, "detail": detail, "severity": severity}


def _is_obviously_conversational(normalized_text: str, word_count: int, has_link_like_content: bool) -> bool:
    if has_link_like_content or word_count == 0:
        return False

    matched_safe_cues = sum(
        1 for pattern in SAFE_CONVERSATIONAL_PATTERNS if re.search(pattern, normalized_text)
    )
    has_only_letters = bool(re.fullmatch(r"[a-z\s'.,!?-]+", normalized_text))

    return matched_safe_cues > 0 and word_count <= 10 and has_only_letters


def _safe_summary(word_count: int) -> str:
    if word_count <= 8:
        return "This looks like a normal conversational message with no phishing cues."
    return "No strong social-engineering signals were detected in this message."


def _heuristic_text_score(text: str) -> Dict[str, Any]:
    normalized_text = _normalize_text(text)
    word_count = len(re.findall(r"\b\w+\b", normalized_text))
    indicators: List[Dict[str, str]] = []
    suspicious_score = 0.0

    has_url = bool(URL_PATTERN.search(text))
    has_email = bool(EMAIL_PATTERN.search(text))
    has_shortened_url = bool(SHORTENER_PATTERN.search(text))
    has_ip_url = bool(IP_URL_PATTERN.search(text))
    all_caps_words = _count_all_caps_words(text)
    repeated_punctuation = len(re.findall(r"[!?]{2,}", text))

    if _is_obviously_conversational(normalized_text, word_count, has_url or has_email):
        return {
            "risk_score": 0.04,
            "word_count": word_count,
            "indicators": [
                _indicator(
                    "Benign conversational pattern",
                    "The message reads like a normal greeting or self-introduction rather than a scam.",
                    "low",
                )
            ],
            "safe_override": True,
        }

    if has_url:
        suspicious_score += 1.4
        indicators.append(
            _indicator(
                "Contains a link",
                "Links can be legitimate, but phishing attempts often rely on them to drive the next action.",
                "medium",
            )
        )
    if has_email:
        suspicious_score += 0.5
    if has_shortened_url:
        suspicious_score += 1.6
        indicators.append(
            _indicator(
                "Shortened URL",
                "Short links hide the true destination and are common in phishing campaigns.",
                "high",
            )
        )
    if has_ip_url:
        suspicious_score += 1.8
        indicators.append(
            _indicator(
                "IP-based link",
                "Direct IP links are unusual for trustworthy user-facing services.",
                "high",
            )
        )
    if all_caps_words >= 2:
        suspicious_score += 0.7
        indicators.append(
            _indicator(
                "Aggressive formatting",
                "Multiple all-caps words suggest pressure-oriented messaging.",
                "medium",
            )
        )
    if repeated_punctuation > 0:
        suspicious_score += 0.4

    for group in SUSPICIOUS_GROUPS.values():
        matches = _find_group_matches(normalized_text, group["patterns"])
        if matches:
            suspicious_score += group["weight"]
            detail = f"{group['detail']} Matches: {', '.join(matches[:4])}."
            severity = "high" if group["weight"] >= 2 else "medium"
            indicators.append(_indicator(group["label"], detail, severity))

    safe_cue_matches = sum(
        1 for pattern in SAFE_CONVERSATIONAL_PATTERNS if re.search(pattern, normalized_text)
    )
    if safe_cue_matches and suspicious_score < 2.5 and not has_url:
        suspicious_score = max(0.0, suspicious_score - 1.1)
        indicators.append(
            _indicator(
                "Friendly tone",
                "The wording contains ordinary conversational cues that reduce phishing risk.",
                "low",
            )
        )

    risk_score = min(0.98, suspicious_score / 8.5)
    return {
        "risk_score": risk_score,
        "word_count": word_count,
        "indicators": indicators[:6],
        "safe_override": False,
    }


def _model_risk_score(model: Any, text: str) -> Optional[float]:
    if model is None:
        return None

    try:
        return float(model.predict_proba([text])[0][1])
    except Exception:
        return None


def analyze_text_message(text: str, model: Any = None, model_threshold: float = 0.4) -> Dict[str, Any]:
    heuristics = _heuristic_text_score(text)
    heuristic_risk = heuristics["risk_score"]
    model_risk = _model_risk_score(model, text)

    if heuristics["safe_override"] and (model_risk is None or model_risk < 0.9):
        return {
            "result": "safe",
            "risk_score": heuristic_risk,
            "confidence_score": 0.97,
            "threshold_used": float(model_threshold),
            "model_score": model_risk,
            "summary": _safe_summary(heuristics["word_count"]),
            "indicators": heuristics["indicators"],
        }

    combined_risk = heuristic_risk
    if model_risk is not None:
        if heuristic_risk >= 0.45:
            combined_risk = (heuristic_risk * 0.65) + (model_risk * 0.35)
        else:
            combined_risk = min(0.95, (heuristic_risk * 0.8) + (model_risk * 0.2))

    indicators = heuristics["indicators"]
    high_signal_count = sum(1 for item in indicators if item["severity"] == "high")

    if combined_risk >= 0.72 or high_signal_count >= 2:
        result = "malicious"
        confidence = max(0.72, combined_risk)
        summary = "This message shows multiple phishing-style pressure or credential-harvesting signals."
    elif combined_risk >= 0.42 or high_signal_count == 1:
        result = "suspicious"
        confidence = max(0.58, combined_risk)
        summary = "This message contains some risky cues and deserves manual verification before acting on it."
    else:
        result = "safe"
        confidence = max(0.78, 1 - combined_risk)
        summary = _safe_summary(heuristics["word_count"])

    if not indicators:
        indicators = [
            _indicator(
                "No risky language found",
                "The text does not contain links, threats, credential requests, or coercive prompts.",
                "low",
            )
        ]

    return {
        "result": result,
        "risk_score": float(round(combined_risk, 4)),
        "confidence_score": float(round(confidence, 4)),
        "threshold_used": float(model_threshold),
        "model_score": None if model_risk is None else float(round(model_risk, 4)),
        "summary": summary,
        "indicators": indicators,
    }
