import express from 'express';
import { scanUrl, scanText } from '../controllers/scanController.js';

const router = express.Router();

router.post('/url', scanUrl);
router.post('/text', scanText);

export default router;
