'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';

export const ExecutionControls = ({
    executeCode,
    isExecuting,
    isConnected,
}: {
    executeCode: () => void;
    isExecuting: boolean;
    isConnected: boolean;
}) => {
    return (
        <Button
            onClick={executeCode}
            className="w-20 h-8 hover:bg-blue-400 bg-blue-500 text-xs"
            disabled={isExecuting || !isConnected}
        >
            {isExecuting ? (
                <Loader2 className="animate-spin w-4 h-4" />
            ) : (
                <>
                    <Play className="w-4 h-4" />
                    Run
                </>
            )}
        </Button>
    );
};