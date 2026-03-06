import express from 'express';
import { registerUser, loginUser, googleLogin } from '../controllers/authController.js'; // Added googleLogin

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin); // NEW GOOGLE ROUTE

export default router;