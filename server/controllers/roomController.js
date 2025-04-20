import { roomService } from '../services/roomService.js';

export const roomController = {
    handleJoinRoom(socket, room, user) {
        try {
            roomService.joinRoom(
                room,
                {
                    socketId: socket.id,
                    ...user
                }
            );

            socket.join(room.roomId);

            return { success: true };
        } catch (error) {
            socket.emit('error', error.message);
            return { success: false, error: error.message };
        }
    },

    handleRoomInfo(socket, roomId) {
        try {
            const room = roomService.getRoom(roomId);
            if (!room) {
                throw new Error('Room not found');
            }

            socket.emit('current-room-info', room);

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
            console.log('this is from hanglr language change', { room, roomId, newLanguage })

            if (room.teacher && room.teacher.socketId !== socket.id) {
                return console.log('Only teacher can change language');
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