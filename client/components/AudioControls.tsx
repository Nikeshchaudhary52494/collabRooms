'use client';

import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

export const AudioControls = ({
  toggleMic,
  isMuted,
}: {
  toggleMic: () => void;
  isMuted: boolean;
}) => {
  return (
    <Button variant="outline" onClick={toggleMic}>
      {isMuted ? <MicOff /> : <Mic />}
    </Button>
  );
};