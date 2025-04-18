'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/providers/socket-provider';
import { SupportedLanguages, UserRole } from '@/types';
import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import debounce from 'lodash.debounce';
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
import { Loader2, Palette, Play, Terminal, } from 'lucide-react';

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
});

export default function ClassroomPage() {
    const params = useParams();
    const roomId = params.roomId;
    const searchParams = useSearchParams();
    const { socket, isConnected } = useSocket();
    const [output, setOutput] = useState('');
    const [userRole, setUserRole] = useState<UserRole>(searchParams.get('role') as UserRole || 'student');
    const [language, setLanguage] = useState<SupportedLanguages>('javascript');
    const [isExecuting, setIsExecuting] = useState(false);
    const [code, setCode] = useState('');
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const peersRef = useRef<Record<string, RTCPeerConnection>>({});
    const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(null);
    const [theme, setTheme] = useState<'vs' | 'vs-dark' | 'hc-black'>('vs-dark');

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'vs') return 'vs-dark';
            if (prev === 'vs-dark') return 'hc-black';
            return 'vs';
        });
    };

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

    const createPeerConnection = (peerId: string): RTCPeerConnection => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peersRef.current[peerId] = peerConnection;

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit('ice-candidate', { to: peerId, candidate: event.candidate });
            }
        };

        peerConnection.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        return peerConnection;
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

        const handleExecutionResult = (output: string) => {
            console.log('Execution result:', output);
            setOutput(output);
            setIsExecuting(false);
        };

        const handleExecutionError = (error: string) => {
            console.error('Execution error:', error);
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

    // Voice chat implementation
    useEffect(() => {
        if (!roomId || !socket) return;

        const startMedia = async () => {
            try {
                const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('Local audio stream:', localStream);
                setLocalAudioStream(localStream);

                socket.emit("join-voice-room", roomId);

                socket.on("user-joined-voice", async ({ peerId }) => {
                    const peerConnection = createPeerConnection(peerId);
                    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);

                    socket.emit("send-offer", { to: peerId, offer });
                });

                socket.on("receive-offer", async ({ from, offer }) => {
                    const peerConnection = createPeerConnection(from);
                    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);

                    socket.emit("send-answer", { to: from, answer });
                });

                socket.on("receive-answer", async ({ from, answer }) => {
                    const peerConnection = peersRef.current[from];
                    if (peerConnection) {
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                    }
                });

                socket.on("ice-candidate", async ({ from, candidate }) => {
                    const peerConnection = peersRef.current[from];
                    if (peerConnection) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                });
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        };

        startMedia();

        return () => {
            Object.values(peersRef.current).forEach(pc => pc.close());
            if (localAudioStream) {
                localAudioStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [roomId, socket]);

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center px-2 sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
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
                        className="w-20 h-8 text-xs"
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
                    <Button
                        variant="outline"
                        className="w-8 border-none h-8 text-xs"
                        onClick={toggleTheme}
                    ><Palette />
                    </Button >
                    <div className='gap-2 flex items-center'>
                        <span
                            className={`inline-block h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        />
                        <span className="text-sm text-muted-foreground">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>

            <ResizablePanelGroup direction="vertical" className="min-h-[80vh]">
                <ResizablePanel defaultSize={75}>
                    <div className="h-full overflow-hidden">
                        <MonacoEditor
                            language={language}
                            theme={theme}
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
                <ResizablePanel defaultSize={25} minSize={10}>
                    <div className="h-full bg-gray-200 p-2 overflow-auto">
                        <div className="flex items-center text-xs font-medium mb-1">
                            <Terminal className="w-3 h-3 mr-2 text-emerald-600" />
                            Output
                        </div>
                        <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                            {output || <span className="text-[#858585]">No output yet</span>}
                        </pre>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}