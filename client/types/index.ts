// Types shared between frontend and backend
export type UserRole = 'teacher' | 'student';

export interface ExecutionResult {
    output: string;
    error?: string;
    timestamp: Date;
}

export interface RoomData {
    code: string;
    language: SupportedLanguages;
    teacher?: string; // socket.id of teacher
    students: string[]; // socket.ids of students
}

export type SupportedLanguages =
    | 'javascript'
    | 'typescript'
    | 'python'
    | 'java'
    | 'c'
    | 'cpp';