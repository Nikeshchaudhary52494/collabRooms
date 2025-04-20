// Types shared between frontend and backend
export type UserRole = 'teacher' | 'student';

export interface ExecutionResult {
    output: string;
    error?: string;
    timestamp: Date;
}

export interface MemberData {
    socketId: string,
    username: string,
    isMuted: Boolean,
}

export interface RoomData {
    id: string;
    name: string;
    teacher: MemberData;
    students: MemberData[];
    code: string;
    language: SupportedLanguages
}

export type SupportedLanguages =
    | 'javascript'
    | 'typescript'
    | 'python'
    | 'java'
    | 'c'
    | 'cpp';