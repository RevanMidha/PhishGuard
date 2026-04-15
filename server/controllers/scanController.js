import { requestUrlScan, requestTextScan } from '../services/mlService.js';

export const scanUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        const mlResponse = await requestUrlScan(url);
        res.json(mlResponse);
    } catch (error) {
        console.error('URL Scan Controller Error:', error.message);
        res.status(500).json({ error: 'Failed to communicate with ML Engine' });
    }
};

export const scanText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        const mlResponse = await requestTextScan(text);
        res.json(mlResponse);
    } catch (error) {
        console.error('Text Scan Controller Error:', error.message);
        res.status(500).json({ error: 'Failed to communicate with ML Engine' });
    }
};
