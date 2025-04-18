export const voiceController = {
    handleJoinVoiceRoom(socket, roomId) {
        socket.join(roomId);
        socket.to(roomId).emit("user-joined-voice", { peerId: socket.id });
    },

    handleOffer(socket, { to, offer }) {
        socket.to(to).emit("receive-offer", { from: socket.id, offer });
    },

    handleAnswer(socket, { to, answer }) {
        socket.to(to).emit("receive-answer", { from: socket.id, answer });
    },

    handleIceCandidate(socket, { to, candidate }) {
        socket.to(to).emit("ice-candidate", { from: socket.id, candidate });
    }
};