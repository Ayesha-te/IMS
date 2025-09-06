declare module 'react18-json-view' {
  import * as React from 'react';

  export interface JsonViewProps {
    src: any;
    collapsed?: boolean | number;
    displayDataTypes?: boolean;
    enableClipboard?: boolean;
    name?: string | false;
    theme?: string | object;
    onEdit?: (edit: any) => void;
    onAdd?: (add: any) => void;
    onDelete?: (del: any) => void;
    style?: React.CSSProperties;
    className?: string;
  }

  const JsonView: React.ComponentType<JsonViewProps>;
  export default JsonView;
}