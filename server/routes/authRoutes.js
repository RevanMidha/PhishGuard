import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js'; // Note the .js extension

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);

export default router;