export const requestUrlScan = async (url) => {
    try {
        // We use native fetch here (Node 18+)
        const response = await fetch('http://127.0.0.1:5001/api/scan/url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        if (!response.ok) {
            throw new Error(`ML Service responded with status ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("ML Service URL Error:", error);
        throw error;
    }
};

export const requestTextScan = async (text) => {
    try {
        const response = await fetch('http://127.0.0.1:5001/api/scan/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            throw new Error(`ML Service responded with status ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("ML Service Text Error:", error);
        throw error;
    }
};

export const requestVisionScan = async ({ imageData, url }) => {
    try {
        const response = await fetch('http://127.0.0.1:5001/api/scan/vision', {
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
