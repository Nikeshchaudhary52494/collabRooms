import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import Peer from 'simple-peer';

interface PeerMap {
    [peerId: string]: Peer.Instance;
}

export const useVoiceRoom = (
    roomId: string | null,
    socket: Socket | null,
    remoteAudioRefs: React.MutableRefObject<{ [peerId: string]: HTMLAudioElement | null }>
) => {
    const peersRef = useRef<PeerMap>({});
    const [isMuted, setIsMuted] = useState(false);
    const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<{ [peerId: string]: MediaStream }>({});

    const createPeer = useCallback((peerId: string, initiator: boolean, stream: MediaStream): Peer.Instance => {
        if (peersRef.current[peerId]) {
            return peersRef.current[peerId];
        }

        const peer = new Peer({
            initiator,
            stream,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peersRef.current[peerId] = peer;

        peer.on('signal', (data) => {
            socket?.emit('signal', { to: peerId, signal: data });
        });

        peer.on('stream', (remoteStream) => {
            setRemoteStreams(prev => {
                if (prev[peerId]?.id !== remoteStream.id) {
                    return { ...prev, [peerId]: remoteStream };
                }
                return prev;
            });

            setActiveSpeakers(prev =>
                prev.includes(peerId) ? prev : [...prev, peerId]
            );
        });

        peer.on('error', (err) => {
            console.error(`Peer ${peerId} error:`, err);
            if (!peer.destroyed) peer.destroy();
            delete peersRef.current[peerId];
        });

        peer.on('close', () => {
            delete peersRef.current[peerId];
            setActiveSpeakers(prev => prev.filter(id => id !== peerId));
        });

        return peer;
    }, [socket, remoteAudioRefs]);

    const cleanup = useCallback(() => {
        Object.values(peersRef.current).forEach(peer => {
            peer.removeAllListeners();
            peer.destroy();
        });
        peersRef.current = {};

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Object.keys(remoteAudioRefs.current).forEach(peerId => {
        if (remoteAudioRefs.current) {
            remoteAudioRefs.current!.srcObject = null;
        }
        // });
    }, [remoteAudioRefs]);

    useEffect(() => {
        if (!roomId || !socket) return;

        const startMedia = async () => {
            try {
                const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = localStream;

                socket.emit("join-voice-room", roomId);

                socket.on("user-joined-voice", (peerId) => {
                    if (!peersRef.current[peerId]) {
                        createPeer(peerId, true, localStream);
                    }
                });

                socket.on("user-signal", ({ peerId, signal }) => {
                    console.log("Received signal from peer:", peerId, signal);
                    const peer = peersRef.current[peerId];
                    if (peer) {
                        peer.signal(signal);
                    } else {
                        createPeer(peerId, false, localStream).signal(signal);
                    }
                });

                socket.on("user-left-voice", (peerId) => {
                    const peer = peersRef.current[peerId];
                    if (peer) {
                        peer.removeAllListeners();
                        peer.destroy();
                        delete peersRef.current[peerId];
                    }
                    if (remoteAudioRefs.current) {
                        remoteAudioRefs.current.srcObject = null;
                    }
                    setActiveSpeakers(prev => prev.filter(id => id !== peerId));
                });

            } catch (error) {
                console.error('Error accessing media:', error);
            }
        };

        startMedia();

        return () => {
            cleanup();
            socket.off('user-joined-voice');
            socket.off('user-signal');
            socket.off('user-left-voice');
            socket.emit("leave-voice-room", roomId);
        };
    }, [roomId, socket, createPeer, cleanup, remoteAudioRefs]);

    const toggleMic = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(prev => !prev);
        }
    }, []);

    return { isMuted, toggleMic, activeSpeakers, remoteStreams };
};