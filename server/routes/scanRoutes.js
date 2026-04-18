import express from 'express';
import { scanUrl, scanText, scanVision, getStats } from '../controllers/scanController.js';

const router = express.Router();

router.get('/stats', getStats);
router.post('/url', scanUrl);
router.post('/text', scanText);
router.post('/vision', scanVision);

export default router;
