'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/providers/socket-provider';
import { SupportedLanguages, UserRole } from '@/types';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import debounce from 'lodash.debounce';
import { helloWorldSnippets } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Loader2, Play } from 'lucide-react';

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
});


export default function ClassroomPage({ roomId }: { roomId: string }) {
    const searchParams = useSearchParams();
    const { socket, isConnected } = useSocket();
    const [output, setOutput] = useState('');
    const [userRole, setUserRole] = useState<UserRole>(searchParams.get('role') as UserRole || 'student');
    const [language, setLanguage] = useState<SupportedLanguages>('javascript');
    const [isExecuting, setIsExecuting] = useState(false);
    const [code, setCode] = useState(helloWorldSnippets["javascript"]);


    // Debounced version of emitting code change
    const emitCodeChange = useCallback(
        debounce((newCode: string) => {
            socket?.emit('code-change', roomId, newCode);
        }, 300),
        [socket, roomId]
    );
    const handleCodeChange = (newValue: string | undefined) => {
        if (newValue === undefined) return;
        setCode(newValue);
        emitCodeChange(newValue);
    };

    const handleLanguageChange = (newLanguage: SupportedLanguages) => {
        setLanguage(newLanguage);
        // @ts-ignore
        setCode(helloWorldSnippets[newLanguage]);
        socket?.emit('language-change', roomId, newLanguage);
    };

    const executeCode = () => {
        if (!socket || isExecuting) return;

        setIsExecuting(true);
        console.log(isExecuting, 'isExecuting');

        setOutput('Executing...');

        try {
            socket.emit('execute-code', roomId, code, language);
        } catch (error) {
            setOutput(`Error: ${error instanceof Error ? error.message : 'Execution failed'}`);
            setIsExecuting(false);
        }
    };

    // Join room when socket/userRole/roomId changes
    useEffect(() => {
        if (socket) {
            socket.emit('join-room', roomId, userRole);
        }
    }, [socket, userRole, roomId]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleCodeUpdate = (newCode: string) => {
            if (newCode !== code) {
                console.log('Code updated from server:', newCode);
                setCode(newCode);
            }
        };

        const handleLanguageUpdate = (lang: SupportedLanguages) => {
            setLanguage(lang);
        };

        const handleExecutionResult = (result: { output: string }) => {
            setOutput(result.output);
            setIsExecuting(false);
        };

        const handleExecutionError = (error: string) => {
            setOutput(`Error: ${error}`);
            setIsExecuting(false);
        };

        socket.on('code-update', handleCodeUpdate);
        socket.on('language-update', handleLanguageUpdate);
        socket.on('execution-result', handleExecutionResult);
        socket.on('execution-error', handleExecutionError);

        return () => {
            socket.off('code-update', handleCodeUpdate);
            socket.off('language-update', handleLanguageUpdate);
            socket.off('execution-result', handleExecutionResult);
            socket.off('execution-error', handleExecutionError);
        };
    }, [socket, code]);

    return (
        <div className="p-10 mx-auto bg-gray-100 w-full">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="language">Language:</Label>
                            <Select
                                value={language}
                                onValueChange={handleLanguageChange}
                                disabled={userRole === 'student'}
                            >
                                <SelectTrigger id="language" className="w-[180px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(['javascript', 'typescript', 'python', 'java', 'c', 'cpp'] as const).map((lang) => (
                                        <SelectItem key={lang} value={lang}>
                                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={executeCode}
                            className="w-20"
                            disabled={isExecuting || !isConnected}
                        >
                            {
                                isExecuting ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Run
                                    </>
                                )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-block h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        />
                        <span className="text-sm text-muted-foreground">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                <ResizablePanelGroup direction="vertical" className="min-h-[80vh]">
                    <ResizablePanel defaultSize={75}>
                        <div className="h-full rounded-lg border overflow-hidden">
                            <MonacoEditor
                                language={language}
                                theme="vs-dark"
                                value={code}
                                options={{
                                    automaticLayout: true,
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                }}
                                onChange={handleCodeChange}
                            />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={25}>
                        <div className="h-full rounded-lg bg-muted p-4 overflow-auto">
                            <h3 className="font-medium mb-2">Output:</h3>
                            <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                                {output || 'Output will appear here...'}
                            </pre>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div >
    );
}