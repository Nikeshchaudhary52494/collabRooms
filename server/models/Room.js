import { HELLO_WORLD_SNIPPETS } from '../config/constants.js';

export class Room {
    constructor(room, user) {
        this.id = room.roomId;
        this.name = room.roomname;
        this.teacher = user;
        this.students = [];
        this.code = HELLO_WORLD_SNIPPETS['javascript'];
        this.language = 'javascript';
        this.createdAt = new Date();
    }

    addUser(user) {
        if (user.role === 'teacher') {
            if (this.teacher) {
                throw new Error('Teacher already exists in this room');
            }
            this.teacher = user;
        } else if (!this.students.find(u => u.socketId === user.socketId)) {
            this.students.push(user);
        }
    }

    removeUser(socketId) {
        if (this.teacher?.socketId === socketId) {
            this.teacher = null;
        } else {
            this.students = this.students.filter(user => user.socketId !== socketId);
        }
    }

    isEmpty() {
        return !this.teacher && this.students.length === 0;
    }
}
