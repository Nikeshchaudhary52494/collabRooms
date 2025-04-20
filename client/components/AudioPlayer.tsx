import React, { memo, useEffect, useRef } from 'react';

const AudioPlayer = memo(({ stream }: { stream: MediaStream }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio && audio.srcObject !== stream) {
            audio.srcObject = stream;
        }

        return () => {
            if (audio) {
                audio.srcObject = null;
            }
        };
    }, [stream]);

    return (
        <audio
            ref={audioRef}
            autoPlay
            playsInline
            style={{ display: 'none' }}
            onError={(e) => console.error('Audio error:', e)}
        />
    );
});

export default AudioPlayer;
