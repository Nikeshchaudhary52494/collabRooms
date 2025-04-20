'use client';

import dynamic from 'next/dynamic';
import { SupportedLanguages } from '@/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

export const CodeEditor = ({
  language,
  theme,
  code,
  handleCodeChange,
}: {
  language: SupportedLanguages;
  theme: 'vs' | 'vs-dark' | 'hc-black';
  code: string;
  handleCodeChange: (value: string | undefined) => void;
}) => {
  return (
    <MonacoEditor
      language={language}
      theme={theme}
      value={code}
      options={{
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
      }}
      onChange={handleCodeChange}
    />
  );
};