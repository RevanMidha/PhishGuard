import express from 'express';
import { scanUrl, scanText, getStats } from '../controllers/scanController.js';

const router = express.Router();

router.get('/stats', getStats);
router.post('/url', scanUrl);
router.post('/text', scanText);

export default router;
