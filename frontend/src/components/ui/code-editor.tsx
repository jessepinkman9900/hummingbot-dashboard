'use client';

import { Editor } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  language?: string;
  height?: string;
  readOnly?: boolean;
  onChange?: (value: string | undefined) => void;
}

export function CodeEditor({
  value,
  language = 'python',
  height = '600px',
  readOnly = true,
  onChange,
}: CodeEditorProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage={language}
        value={value}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          wrappingIndent: 'same',
          padding: { top: 16, bottom: 16 },
        }}
        onChange={onChange}
      />
    </div>
  );
}
