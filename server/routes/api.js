import express from 'express';
import { roomService } from '../services/roomService.js';

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        rooms: roomService.getAllRoomsInfo().length,
        uptime: process.uptime()
    });
});

router.get('/rooms', (req, res) => {
    res.status(200).json({
        rooms: roomService.getAllRoomsInfo()
    });
});

export default router;