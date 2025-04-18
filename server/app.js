import express from 'express';
import cors from 'cors';
import http from 'http';
import { CORS_OPTIONS } from './config/constants.js';
import apiRoutes from './routes/api.js';
import { socketRoutes } from './routes/socket.js';

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);


// Create server
export const server = http.createServer(app);

// Socket.io setup
import { Server } from 'socket.io';
export const io = new Server(server, {
    cors: CORS_OPTIONS
});

// Socket routes
socketRoutes(io);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});