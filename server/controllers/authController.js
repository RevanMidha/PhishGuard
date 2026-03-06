import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
export const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ message: 'User or Email already exists' });

    const user = await User.create({ name, username, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
export const googleLogin = async (req, res) => {
  const { access_token } = req.body;

  try {
    // 1. Fetch user profile from Google using the token
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { name, email } = data;

    // 2. Check if user already exists in your DB
    let user = await User.findOne({ email });

    if (!user) {
      // 3. If new user, create them. 
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      // Generate a unique username from their email prefix
      let baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      
      while(await User.findOne({ username })) {
         username = `${baseUsername}${counter}`;
         counter++;
      }

      user = await User.create({
        name,
        email,
        username,
        password: randomPassword 
      });
    }

    // 4. Send back your standard JWT token and user info
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};