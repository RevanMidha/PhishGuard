import { requestUrlScan, requestTextScan } from '../services/mlService.js';
import Scan from '../models/Scan.js';

export const scanUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        const mlResponse = await requestUrlScan(url);
        
        // Fire-and-forget logging to MongoDB
        Scan.create({ 
            scanType: 'url', 
            inputSnippet: url, 
            result: mlResponse.result 
        }).catch(e => console.error('Failed to log scan:', e.message));

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
        
        // Fire-and-forget logging to MongoDB
        Scan.create({ 
            scanType: 'text', 
            inputSnippet: text.substring(0, 150), // Don't save full text, just a snippet for privacy
            result: mlResponse.result 
        }).catch(e => console.error('Failed to log scan:', e.message));

        res.json(mlResponse);
    } catch (error) {
        console.error('Text Scan Controller Error:', error.message);
        res.status(500).json({ error: 'Failed to communicate with ML Engine' });
    }
};

export const getStats = async (req, res) => {
    try {
        const totalScans = await Scan.countDocuments();
        const threatsBlocked = await Scan.countDocuments({ result: 'malicious' });
        res.json({ totalScans, threatsBlocked });
    } catch (error) {
        console.error('Stats Controller Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch telemetry stats' });
    }
};
