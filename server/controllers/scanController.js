import { requestUrlScan, requestTextScan, requestVisionScan } from '../services/mlService.js';
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
            result: mlResponse.result,
            confidenceScore: mlResponse.confidence_score
        }).catch(e => console.error('Failed to log scan:', e.message));

        res.json(mlResponse);
    } catch (error) {
        console.error('Text Scan Controller Error:', error.message);
        res.status(500).json({ error: 'Failed to communicate with ML Engine' });
    }
};

export const scanVision = async (req, res) => {
    try {
        const { imageData, url } = req.body;
        if (!imageData) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        const mlResponse = await requestVisionScan({ imageData, url });

        Scan.create({
            scanType: 'vision',
            inputSnippet: url || 'uploaded screenshot',
            result: mlResponse.result,
            confidenceScore: mlResponse.confidence_score
        }).catch(e => console.error('Failed to log scan:', e.message));

        res.json(mlResponse);
    } catch (error) {
        console.error('Vision Scan Controller Error:', error.message);
        res.status(500).json({ error: 'Failed to communicate with ML Engine' });
    }
};

let statsCache = { data: null, timestamp: 0 };
const STATS_CACHE_TTL_MS = 5000;

export const getStats = async (req, res) => {
    try {
        const now = Date.now();
        if (statsCache.data && (now - statsCache.timestamp < STATS_CACHE_TTL_MS)) {
            return res.json(statsCache.data);
        }

        const totalScans = await Scan.estimatedDocumentCount();
        const threatsBlocked = await Scan.countDocuments({ result: { $in: ['malicious', 'suspicious'] } });
        
        statsCache = {
            data: { totalScans, threatsBlocked },
            timestamp: now
        };

        res.json(statsCache.data);
    } catch (error) {
        console.error('Stats Controller Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch telemetry stats' });
    }
};
