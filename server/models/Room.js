import { HELLO_WORLD_SNIPPETS } from '../config/constants.js';

export class Room {
    constructor(roomId, initialUser) {
        this.id = roomId;
        this.teacher = initialUser.role === 'teacher' ? initialUser.socketId : null;
        this.students = initialUser.role === 'student' ? [initialUser.socketId] : [];
        this.code = HELLO_WORLD_SNIPPETS['javascript'];
        this.language = 'javascript';
        this.createdAt = new Date();
    }

    addUser(user) {
        if (user.role === 'teacher') {
            if (this.teacher) {
                throw new Error('Teacher already exists in this room');
            }
            this.teacher = user.socketId;
        } else if (!this.students.includes(user.socketId)) {
            this.students.push(user.socketId);
        }
    }

    removeUser(socketId) {
        if (this.teacher === socketId) {
            this.teacher = null;
        } else {
            this.students = this.students.filter(id => id !== socketId);
        }
    }

    isEmpty() {
        return !this.teacher && this.students.length === 0;
    }
}