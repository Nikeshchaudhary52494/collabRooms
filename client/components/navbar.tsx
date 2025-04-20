'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

export function Navbar() {
    const pathname = usePathname();

    return (
        <header className="h-16 container mx-auto flex  items-center justify-between px-6">
            <Link href="/" className="font-bold text-gray-900">
                collabRooms
            </Link>

            <nav className="flex items-center gap-6">

                {pathname !== '/' && (
                    <Button asChild variant="ghost" className="md:hidden">
                        <Link href="/">Home</Link>
                    </Button>
                )}

                <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Link href="/create-room" className="flex items-center gap-2">
                        <span className="hidden md:inline">Create Room</span>
                        <span className="md:hidden">+</span>
                    </Link>
                </Button>
            </nav>
        </header>
    );
}