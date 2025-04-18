import { executionService } from '../services/executionService.js';
import { roomService } from '../services/roomService.js';

export const executionController = {
    async handleCodeExecution(_, roomId) {
        try {
            const room = roomService.getRoom(roomId);
            if (!room) {
                throw new Error('Room not found');
            }

            const result = await executionService.executeCode(room.code, room.language);
            const executionResult = {
                ...result,
                timestamp: new Date(),
                language: room.language
            };

            return { success: true, result: executionResult };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};