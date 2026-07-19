import { type ToolMode } from '../../types/template';

interface ToolbarProps {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
}

const tools: { id: ToolMode; label: string; icon: string }[] = [
  {
    id: 'select',
    label: 'Select',
    icon: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z',
  },
  {
    id: 'text',
    label: 'Text',
    icon: 'M4 7V4h16v3M9 20h6M12 4v16',
  },
  {
    id: 'image',
    label: 'Image',
    icon: 'M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z',
  },
];

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-surface border-b border-border">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium',
            'transition-colors duration-150 press-feedback cursor-pointer',
            activeTool === tool.id
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
          ].join(' ')}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={tool.icon} />
          </svg>
          {tool.label}
        </button>
      ))}
    </div>
  );
}
