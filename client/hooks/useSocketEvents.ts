import { useEffect, useState, useCallback } from 'react';
import { SupportedLanguages } from '@/types';
import { Socket } from 'socket.io-client';

export const useSocketEvents = (
    socket: Socket | null,
) => {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState<SupportedLanguages>('javascript');
    const [isExecuting, setIsExecuting] = useState(false);

    const onCodeUpdate = useCallback((newCode: string) => {
        if (newCode !== code) {
            console.log('Code updated from server:', newCode);
            setCode(newCode);
        }
    }, [code]);

    const onLanguageUpdate = useCallback((lang: SupportedLanguages) => {
        console.log('Language updated:', lang);
        setLanguage(lang);
    }, []);

    const onExecutionResult = useCallback((result: string) => {
        console.log('Execution result:', result);
        setOutput(result);
        setIsExecuting(false);
    }, []);

    const onExecutionError = useCallback((error: string) => {
        console.error('Execution error:', error);
        setOutput(`Error: ${error}`);
        setIsExecuting(false);
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('code-update', onCodeUpdate);
        socket.on('language-update', onLanguageUpdate);
        socket.on('execution-result', onExecutionResult);
        socket.on('execution-error', onExecutionError);

        return () => {
            socket.off('code-update', onCodeUpdate);
            socket.off('language-update', onLanguageUpdate);
            socket.off('execution-result', onExecutionResult);
            socket.off('execution-error', onExecutionError);
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
    };
};
