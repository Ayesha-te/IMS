import React from 'react';

/**
 * Simple JSON viewer without external dependencies.
 * Usage: <DebugJson data={yourData} />
 */
export interface DebugJsonProps {
  data: unknown;
  collapsed?: boolean | number; // kept for backward compatibility (unused)
  className?: string;
}

export const DebugJson: React.FC<DebugJsonProps> = ({ data, className }) => {
  return (
    <div className={className ?? 'p-4 bg-white rounded border'}>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default DebugJson;