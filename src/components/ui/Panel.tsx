import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Panel({ children, className = '', title }: PanelProps) {
  return (
    <div
      className={[
        'bg-surface border-l border-border',
        'flex flex-col h-full',
        className,
      ].join(' ')}
    >
      {title && (
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            {title}
          </h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </div>
  );
}
