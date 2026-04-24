const urlCache = new Map();
const textCache = new Map();
const TTL = 60000; // 1 min

export const requestUrlScan = async (url) => {
    try {
        if (urlCache.has(url)) {
            const cached = urlCache.get(url);
            if (Date.now() - cached.timestamp < TTL) return cached.data;
        }

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
        urlCache.set(url, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error("ML Service URL Error:", error);
        throw error;
    }
};

export const requestTextScan = async (text) => {
    try {
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
        textCache.set(text, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error("ML Service Text Error:", error);
        throw error;
    }
};

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
