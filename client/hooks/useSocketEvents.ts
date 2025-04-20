import { useEffect, useState, useCallback } from 'react';
import { MemberData, RoomData, SupportedLanguages } from '@/types';
import { Socket } from 'socket.io-client';

export const useSocketEvents = (
    socket: Socket | null,
) => {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState<SupportedLanguages>('javascript');
    const [roomName, setRoomName] = useState('');
    const [teacher, setTeacher] = useState<MemberData | null>(null);
    const [students, setStudents] = useState<MemberData[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);

    const onCodeUpdate = useCallback((newCode: string) => {
        if (newCode !== code) {
            setCode(newCode);
        }
    }, [code]);

    const onLanguageUpdate = useCallback((lang: SupportedLanguages) => {
        setLanguage(lang);
    }, []);

    const onExecutionResult = useCallback((result: string) => {
        setOutput(result);
        setIsExecuting(false);
    }, []);

    const onExecutionError = useCallback((error: string) => {
        console.error('Execution error:', error);
        setOutput(`Error: ${error}`);
        setIsExecuting(false);
    }, []);

    const onCurrenrRoomInfo = useCallback((roominfo: RoomData) => {
        setCode(roominfo.code);
        setLanguage(roominfo.language);
        setRoomName(roominfo.name);
        setTeacher(roominfo.teacher);
        setStudents(roominfo.students);
    }, [])

    useEffect(() => {
        if (!socket) return;

        socket.on('code-update', onCodeUpdate);
        socket.on('language-update', onLanguageUpdate);
        socket.on('execution-result', onExecutionResult);
        socket.on('execution-error', onExecutionError);
        socket.on('current-room-info', onCurrenrRoomInfo);

        return () => {
            socket.off('code-update', onCodeUpdate);
            socket.off('language-update', onLanguageUpdate);
            socket.off('execution-result', onExecutionResult);
            socket.off('execution-error', onExecutionError);
            socket.off('current-room-info', onCurrenrRoomInfo);
        };
    }, [socket, onCodeUpdate, onLanguageUpdate, onExecutionResult, onExecutionError]);

    return {
        code,
        setCode,
        output,
        setOutput,
        language,
        setLanguage,
        isExecuting,
        setIsExecuting,
        teacher,
        students,
        roomName,
    };
};
