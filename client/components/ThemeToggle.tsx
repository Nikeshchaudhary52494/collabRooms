'use client';

import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

export const ThemeToggle = ({
    toggleTheme,
}: {
    toggleTheme: () => void;
}) => {
    return (
        <Button
            variant="outline"
            className="w-8 border-none h-8 text-xs"
            onClick={toggleTheme}
        >
            <Palette />
        </Button>
    );
};