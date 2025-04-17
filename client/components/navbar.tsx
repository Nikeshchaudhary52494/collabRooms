'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

export function Navbar() {
    const pathname = usePathname();

    return (
        <header className="border-b border-gray-200">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <Link href="/" className="font-bold text-gray-900">
                    collabRooms
                </Link>

                <nav className="flex items-center gap-6">

                    {/* Conditional home button - only shown when not on home */}
                    {pathname !== '/' && (
                        <Button asChild variant="ghost" className="md:hidden">
                            <Link href="/">Home</Link>
                        </Button>
                    )}
                    {/* when implementing authentication */}
                    {/* <div className="flex items-center gap-4">
                        <Link
                            href="/sign-in"
                            className="text-sm text-gray-600 hover:text-gray-900 hidden md:block"
                        >
                            Sign in
                        </Link>
                        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Link href="/sign-up">Sign up</Link>
                        </Button>
                    </div> */}

                    <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        <Link href="/create-room" className="flex items-center gap-2">
                            <span className="hidden md:inline">Create Room</span>
                            <span className="md:hidden">+</span>
                        </Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}