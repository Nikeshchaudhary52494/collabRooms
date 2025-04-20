'use client';

import { Terminal } from 'lucide-react';

export const OutputPanel = ({ output }: { output: string }) => {
    return (
        <div className="h-full bg-gray-200 p-2 overflow-auto">
            <div className="flex items-center text-xs font-medium mb-1">
                <Terminal className="w-3 h-3 mr-2 text-emerald-600" />
                Output
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                {output || <span className="text-[#858585]">No output yet</span>}
            </pre>
        </div>
    );
};