export const voiceController = {
    handleJoinVoiceRoom(socket, roomId) {
        socket.join(roomId);
        socket.to(roomId).emit("user-joined-voice", socket.id);

        const room = socket.adapter.rooms.get(roomId);
        const participants = room ? Array.from(room).filter(id => id !== socket.id) : [];

        socket.emit("existing-voice-users", participants);
    },

    handleSignal(socket, { to, signal }) {
        if (!socket.adapter.rooms.has(to)) {
            return socket.emit("error", "Target user not found");
        }

        socket.to(to).emit("user-signal", {
            peerId: socket.id,
            signal
        });
    },

    handleLeaveVoiceRoom(socket, roomId) {
        socket.to(roomId).emit("user-left-voice", socket.id);
        socket.leave(roomId);
    }
};