'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateRoomPage() {
    const [roomName, setRoomName] = useState('');
    const router = useRouter();

    const handleCreateRoom = () => {
        if (!roomName.trim()) return;
        const roomId = generateRoomId();
        router.push(`/classroom/${roomId}?role=teacher`);
    };

    const generateRoomId = () => {
        return Math.random().toString(36).substring(2, 8);
    };

    return (
        <div className="max-w-md mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Create a New Classroom</h1>
                    <p className="text-gray-600">
                        Set up a new coding session for your students
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="room-name" className="text-gray-700">Classroom Name</Label>
                        <Input
                            id="room-name"
                            placeholder="e.g. 'Intro to Python'"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <Button
                        onClick={handleCreateRoom}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={!roomName.trim()}
                    >
                        Create Classroom
                    </Button>
                </div>
            </div>
        </div>
    );
}