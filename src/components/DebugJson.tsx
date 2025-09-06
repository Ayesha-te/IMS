import React from 'react';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

/**
 * Simple JSON viewer component using react18-json-view
 * Usage: <DebugJson data={yourData} collapsed={false} />
 */
export interface DebugJsonProps {
  data: unknown;
  collapsed?: boolean | number; // false, true, or level number
  className?: string;
}

export const DebugJson: React.FC<DebugJsonProps> = ({ data, collapsed = false, className }) => {
  return (
    <div className={className ?? 'p-4 bg-white rounded border'}>
      <JsonView
        src={data as any}
        collapsed={collapsed as any}
        displayDataTypes={false}
        enableClipboard={true}
      />
    </div>
  );
};

export default DebugJson;