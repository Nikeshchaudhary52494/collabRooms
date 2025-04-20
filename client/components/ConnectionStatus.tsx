'use client';

export const ConnectionStatus = ({ isConnected }: { isConnected: boolean }) => {
    return (
        <div className="gap-2 flex items-center">
            <span
                className={`inline-block h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
            />
            <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
            </span>
        </div>
    );
};