import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { metricsHandler, metricsMiddleware } from './middleware/metrics.js';

import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import inviteRoutes from './routes/invite.js';
import aiRoutes from './routes/ai.js';
import timeRoutes from './routes/enterpriseRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

// Connect to Database
connectDB();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 5000 // Increased limit to prevent blocking while debugging
});

const app = express();
const PORT = process.env.PORT || 5000;

// Express 5 already handles req.query safely. 
// Redefining it can cause errors because it's a getter on IncomingMessage.

app.use(helmet());
// app.use(mongoSanitize());
// app.use(hpp());
app.use(cookieParser());
app.use('/api', limiter);

// Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(metricsMiddleware);

// Prometheus metrics endpoint
app.get('/metrics', metricsHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
