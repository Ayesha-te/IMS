import { lazy, Suspense } from 'react';
import type { EditorProps } from '@monaco-editor/react';

// Lazy-load the Monaco editor so it's only loaded client-side
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

export default function MonacoEditorWrapper(props: EditorProps) {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      {/* Drop-in replacement for @monaco-editor/react's default export */}
      <MonacoEditor {...props} />
    </Suspense>
  );
}