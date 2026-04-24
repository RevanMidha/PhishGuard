/**
 * mlService.js — PhishGuard ML Engine Client
 * -------------------------------------------
 * This module handles all communication between the Node.js backend
 * and the Python Flask ML engine running on port 5001.
 *
 * Features:
 *  - In-memory TTL cache to avoid redundant ML calls for repeated inputs
 *  - Separate cache maps for URL, text, and vision scan types
 *  - Reads ML_ENGINE_URL from environment for Docker/local flexibility
 */

// ---------------------------------------------------------------------------
// Cache Configuration
// ---------------------------------------------------------------------------
const urlCache  = new Map(); // Cache for URL scan results
const textCache = new Map(); // Cache for text/email scan results
const TTL = 60000;           // Time-to-live: 60 seconds per cached entry

/**
 * requestUrlScan
 * Sends a URL to the ML engine for phishing analysis.
 * Returns cached result if the same URL was scanned within the TTL window.
 *
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} - { result, confidence_score, threshold_used, canonical_url }
 */
export const requestUrlScan = async (url) => {
    try {
        // Return cached result if still within TTL to avoid unnecessary ML calls
        if (urlCache.has(url)) {
            const cached = urlCache.get(url);
            if (Date.now() - cached.timestamp < TTL) return cached.data;
        }

        // ML_ENGINE_URL is set via Docker Compose env; falls back to container name for local dev
        const mlUrl = process.env.ML_ENGINE_URL || 'http://ml_engine:5001';
        const response = await fetch(`${mlUrl}/api/scan/url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`ML Service responded with status ${response.status}`);
        }

        const data = await response.json();
        // Store result with a timestamp for TTL-based expiry
        urlCache.set(url, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error("ML Service URL Error:", error);
        throw error;
    }
};

/**
 * requestTextScan
 * Sends an email/text message to the ML engine for phishing signal detection.
 * Returns cached result if the same text was scanned within the TTL window.
 *
 * @param {string} text - The raw text or email body to analyze
 * @returns {Promise<Object>} - { result, confidence_score, indicators }
 */
export const requestTextScan = async (text) => {
    try {
        // Return cached result if still within TTL
        if (textCache.has(text)) {
            const cached = textCache.get(text);
            if (Date.now() - cached.timestamp < TTL) return cached.data;
        }

        const mlUrl = process.env.ML_ENGINE_URL || 'http://ml_engine:5001';
        const response = await fetch(`${mlUrl}/api/scan/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`ML Service responded with status ${response.status}`);
        }

        const data = await response.json();
        // Store result with a timestamp for TTL-based expiry
        textCache.set(text, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error("ML Service Text Error:", error);
        throw error;
    }
};

/**
 * requestVisionScan
 * Sends a base64-encoded screenshot to the ML engine for visual phishing detection.
 * Uses OCR + heuristic analysis — results are NOT cached due to large payload size.
 *
 * @param {Object} params
 * @param {string} params.imageData - Base64-encoded screenshot image
 * @param {string} params.url       - (Optional) URL context for the screenshot
 * @returns {Promise<Object>} - { result, confidence_score, ocr_text, indicators }
 */
export const requestVisionScan = async ({ imageData, url }) => {
    try {
        const mlUrl = process.env.ML_ENGINE_URL || 'http://ml_engine:5001';
        const response = await fetch(`${mlUrl}/api/scan/vision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData, url })
        });

        if (!response.ok) {
            throw new Error(`ML Service responded with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("ML Service Vision Error:", error);
        throw error;
    }
};
