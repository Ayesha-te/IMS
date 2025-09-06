import { lazy, Suspense } from 'react';

// Lazy-load the Monaco editor so it's only loaded client-side
const MonacoEditor = lazy(() => import('@monaco-editor/react'));

export default function MonacoEditorWrapper() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      {/* Adjust props as needed for your use case */}
      <MonacoEditor height="400px" defaultLanguage="javascript" />
    </Suspense>
  );
}