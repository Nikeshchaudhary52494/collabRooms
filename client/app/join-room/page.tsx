'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSocket } from '@/providers/socket-provider';

export default function JoinRoomPage() {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const router = useRouter();
    const { socket } = useSocket();

    const handleJoinRoom = () => {
        if (!socket) return;
        if (!roomId.trim() || !username.trim()) return;
        socket.emit('join-room', { roomId }, { role: 'student', username, isMuted: true });
        router.push(`/classroom/${roomId}?role=student`);
    };

    return (
        <div className="max-w-md mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="space-y-8 ">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Join a Classroom</h1>
                    <p className="text-gray-600">
                        Enter the classroom ID provided by your teacher
                    </p>
                </div>

                <div className="space-y-4">

                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-gray-700">Your Name</Label>
                        <Input
                            id="username"
                            placeholder="e.g. 'John Doe'"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="room-id" className="text-gray-700">Classroom ID</Label>
                        <Input
                            id="room-id"
                            placeholder="Enter classroom ID"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <Button
                        onClick={handleJoinRoom}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!roomId.trim()}
                    >
                        Join Classroom
                    </Button>
                </div>
            </div>
        </div>
    );
}