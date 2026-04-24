    import dotenv from 'dotenv';
    dotenv.config();
    import express from 'express';
    import cors from 'cors';
    import connectDB from './config/db.js';
    import authRoutes from './routes/authRoutes.js';
    import scanRoutes from './routes/scanRoutes.js';
    import feedbackRoutes from './routes/feedbackRoutes.js';

    const app = express();

    app.get('/', (req, res) => {
    res.send('PhishGuard API is successfully running!');
    });

    // Connect to Database
    connectDB();

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/scan', scanRoutes);
    app.use('/api/feedback', feedbackRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
