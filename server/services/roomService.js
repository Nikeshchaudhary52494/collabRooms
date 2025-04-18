import { Room } from '../models/Room.js';
import { HELLO_WORLD_SNIPPETS } from '../config/constants.js';

class RoomService {
    constructor() {
        this.rooms = {};
    }

    createRoom(roomId, user) {
        if (this.rooms[roomId]) {
            throw new Error('Room already exists');
        }
        this.rooms[roomId] = new Room(roomId, user);
        return this.rooms[roomId];
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }

    joinRoom(roomId, user) {
        if (!this.rooms[roomId]) {
            return this.createRoom(roomId, user);
        }
        this.rooms[roomId].addUser(user);
        return this.rooms[roomId];
    }

    leaveRoom(roomId, socketId) {
        if (!this.rooms[roomId]) return false;

        this.rooms[roomId].removeUser(socketId);

        if (this.rooms[roomId].isEmpty()) {
            delete this.rooms[roomId];
            return true;
        }
        return false;
    }

    updateCode(roomId, newCode) {
        if (!this.rooms[roomId]) {
            throw new Error('Room not found');
        }
        this.rooms[roomId].code = newCode;
    }

    updateLanguage(roomId, newLanguage) {
        if (!this.rooms[roomId]) {
            throw new Error('Room not found');
        }
        if (!HELLO_WORLD_SNIPPETS[newLanguage]) {
            throw new Error('Unsupported language');
        }
        this.rooms[roomId].language = newLanguage;
        this.rooms[roomId].code = HELLO_WORLD_SNIPPETS[newLanguage] || '';
    }

    getAllRoomsInfo() {
        return Object.keys(this.rooms).map(roomId => ({
            id: roomId,
            teacher: this.rooms[roomId].teacher,
            students: this.rooms[roomId].students.length,
            language: this.rooms[roomId].language,
            createdAt: this.rooms[roomId].createdAt
        }));
    }
}

export const roomService = new RoomService();