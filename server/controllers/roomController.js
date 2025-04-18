import { roomService } from '../services/roomService.js';

export const roomController = {
    handleJoinRoom(socket, roomId, userRole) {
        try {
            const room = roomService.joinRoom(roomId, {
                socketId: socket.id,
                role: userRole
            });

            socket.join(roomId);

            socket.emit('code-update', room.code);
            socket.emit('language-update', room.language);
            socket.emit('room-info', {
                teacher: !!room.teacher,
                studentCount: room.students.length
            });

            socket.to(roomId).emit('user-joined', {
                id: socket.id,
                role: userRole
            });

            return { success: true };
        } catch (error) {
            socket.emit('error', error.message);
            return { success: false, error: error.message };
        }
    },

    handleCodeChange(socket, roomId, newCode) {
        try {
            roomService.updateCode(roomId, newCode);
            socket.to(roomId).emit('code-update', newCode);
            return { success: true };
        } catch (error) {
            socket.emit('error', error.message);
            return { success: false, error: error.message };
        }
    },

    handleLanguageChange(socket, io, roomId, newLanguage) {
        try {
            const room = roomService.getRoom(roomId);

            if (room.teacher && room.teacher !== socket.id) {
                throw new Error('Only teacher can change language');
            }

            roomService.updateLanguage(roomId, newLanguage);
            const updatedRoom = roomService.getRoom(roomId);

            socket.to(roomId).emit('language-update', newLanguage);
            io.to(roomId).emit('code-update', updatedRoom.code);

            return { success: true };
        } catch (error) {
            socket.emit('error', error.message);
            return { success: false, error: error.message };
        }
    },

    handleLeaveRoom(socket, roomId) {
        const roomDeleted = roomService.leaveRoom(roomId, socket.id);
        socket.leave(roomId);
        socket.to(roomId).emit('user-left', { id: socket.id });

        if (roomDeleted) {
            socket.to(roomId).emit('room-closed');
        }
    }
};