import { roomController } from '../controllers/roomController.js';
import { executionController } from '../controllers/executionController.js';
import { voiceController } from '../controllers/voiceController.js';

export const socketRoutes = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected', socket.id);

        socket.on('join-room', (roomId, userRole) => {
            roomController.handleJoinRoom(socket, roomId, userRole);
        });

        socket.on('code-change', (roomId, newCode) => {
            roomController.handleCodeChange(socket, roomId, newCode);
        });

        socket.on('language-change', (roomId, newLanguage) => {
            roomController.handleLanguageChange(socket, io, roomId, newLanguage);
        });

        socket.on('execute-code', async (roomId) => {
            const { result, success, error } = await executionController.handleCodeExecution(socket, roomId);
            if (success) {
                if (result?.output) {
                    io.to(roomId).emit('execution-result', result.output);
                } else {
                    io.to(roomId).emit('execution-error', result?.error || 'Execution failed');
                }
            } else {
                socket.emit('execution-error', error || 'Execution failed');
            }
        });

        socket.on("join-voice-room", (roomId) => {
            voiceController.handleJoinVoiceRoom(socket, roomId);
        });

        socket.on("send-offer", (data) => {
            voiceController.handleOffer(socket, data);
        });

        socket.on("send-answer", (data) => {
            voiceController.handleAnswer(socket, data);
        });

        socket.on("ice-candidate", (data) => {
            voiceController.handleIceCandidate(socket, data);
        });

        socket.on('leave-room', (roomId) => {
            roomController.handleLeaveRoom(socket, roomId);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });
};