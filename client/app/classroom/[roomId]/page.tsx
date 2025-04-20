'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useSocket } from '@/providers/socket-provider';
import { SupportedLanguages, UserRole } from '@/types';
import { useParams, useSearchParams } from 'next/navigation';
import debounce from 'lodash.debounce';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useVoiceRoom } from '@/hooks/useVoiceRoom';
import { useSocketEvents } from '@/hooks/useSocketEvents';

import { AudioControls } from '@/components/AudioControls';
import { CodeEditor } from '@/components/CodeEditor';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ExecutionControls } from '@/components/ExecutionControls';
import { LanguageSelector } from '@/components/LanguageSelector';
import { OutputPanel } from '@/components/OutputPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';

export default function ClassroomPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const roomId = params.roomId as string;
    const userRole = searchParams.get('role') as UserRole || 'student';
    const remoteAudioRefs = useRef<{ [peerId: string]: HTMLAudioElement | null }>({});
    const [theme, setTheme] = useState<'vs' | 'vs-dark' | 'hc-black'>('vs-dark');
    const [isCopied, setIsCopied] = useState(false);

    console.log(remoteAudioRefs.current, 'remoteAudioRefs.current.length');

    const { socket, isConnected } = useSocket();
    const { isMuted, toggleMic, activeSpeakers, remoteStreams } = useVoiceRoom(roomId, socket, remoteAudioRefs);


    const {
        code,
        setCode,
        output,
        setOutput,
        language,
        setLanguage,
        isExecuting,
        setIsExecuting
    } = useSocketEvents(socket);

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'vs') return 'vs-dark';
            if (prev === 'vs-dark') return 'hc-black';
            return 'vs';
        });
    };

    const emitCodeChange = useCallback(
        (newCode: string) => {
            if (!socket || !roomId) return;
            const debouncedEmit = debounce((code: string) => {
                socket.emit('code-change', roomId, code);
            }, 300);
            debouncedEmit(newCode);
        },
        [socket, roomId]
    );
    const handleCodeChange = (newValue: string | undefined) => {
        if (newValue === undefined) return;
        setCode(newValue);
        emitCodeChange(newValue);
    };

    const handleLanguageChange = (newLanguage: SupportedLanguages) => {
        setLanguage(newLanguage);
        socket?.emit('language-change', roomId, newLanguage);
    };

    const executeCode = () => {
        if (!socket || isExecuting) return;

        setIsExecuting(true);
        setOutput('Executing...');

        try {
            socket.emit('execute-code', roomId, code, language);
        } catch (error) {
            setOutput(`Error: ${error instanceof Error ? error.message : 'Execution failed'}`);
            setIsExecuting(false);
        }
    };

    const copyRoomId = useCallback(() => {
        navigator.clipboard.writeText(roomId)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch((err) => {
                console.error('Failed to copy room ID:', err);
            });
    }, [roomId]);

    useEffect(() => {
        if (!roomId || !socket) return;

        socket.emit('join-room', roomId, userRole);
        return () => {
            socket.emit('leave-voice-room', roomId);
        };
    }, [socket, userRole, roomId]);

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center px-2 sm:justify-between">
                <div className="flex items-center gap-4">
                    <LanguageSelector
                        language={language}
                        handleLanguageChange={handleLanguageChange}
                        disabled={userRole === 'student'}
                    />

                    <ExecutionControls
                        executeCode={executeCode}
                        isExecuting={isExecuting}
                        isConnected={isConnected}
                    />

                </div>

                <div className="flex items-center gap-2">
                    <div className="speakers">
                        {activeSpeakers.length === 0 ? (
                            <p>No active speakers</p>
                        ) : (
                            activeSpeakers.map(peerId => (
                                <div key={peerId} className="speaker">
                                    <p>User {peerId.slice(0, 5)}</p>
                                    {remoteStreams[peerId] && (
                                        <AudioPlayer stream={remoteStreams[peerId]} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <AudioControls toggleMic={toggleMic} isMuted={isMuted} />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyRoomId}
                        className="flex items-center gap-2"
                    >
                        {isCopied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Copy Room ID
                            </>
                        )}
                    </Button>
                    <ThemeToggle toggleTheme={toggleTheme} />
                    <ConnectionStatus isConnected={isConnected} />
                </div>
            </div>

            <ResizablePanelGroup direction="vertical" className="min-h-[80vh]">
                <ResizablePanel defaultSize={75}>
                    <div className="h-full overflow-hidden">
                        <CodeEditor
                            language={language}
                            theme={theme}
                            code={code}
                            handleCodeChange={handleCodeChange}
                        />
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={25} minSize={10}>
                    <OutputPanel output={output} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}