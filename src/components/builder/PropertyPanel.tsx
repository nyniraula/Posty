import {
  type Field,
  isTextField,
  isImageField,
  POSTER_FONTS,
} from '../../types/template';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';

interface PropertyPanelProps {
  field: Field | null;
  onUpdate: (id: string, updates: Partial<Field>) => void;
  onDelete: (id: string) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

export function PropertyPanel({ field, onUpdate, onDelete, onBringToFront, onSendToBack }: PropertyPanelProps) {
  if (!field) {
    return (
      <Panel title="Properties">
        <div className="flex items-center justify-center h-32 text-sm text-text-tertiary">
          Select a field to edit
        </div>
      </Panel>
    );
  }

  const update = (updates: Partial<Field>) => onUpdate(field.id, updates);

  return (
    <Panel title="Properties">
      <div className="space-y-4">
        {/* Common: ID (read-only) */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">Field ID</span>
          <span className="text-xs font-mono text-text-tertiary bg-surface-elevated px-2 py-1 rounded-[var(--radius-sm)]">
            {field.id}
          </span>
        </div>

        {/* Common: Label */}
        <Input
          label="Label"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
        />

        {/* ── Text-specific properties ── */}
        {isTextField(field) && (
          <>
            <Select
              label="Font Family"
              value={field.fontFamily}
              onChange={(e) => update({ fontFamily: e.target.value })}
              options={POSTER_FONTS.map((f) => ({ value: f, label: f }))}
            />

            <Input
              label="Font Size"
              type="number"
              value={field.fontSize}
              onChange={(e) =>
                update({ fontSize: parseInt(e.target.value) || 16 })
              }
              min={8}
              max={200}
            />

            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Font Weight"
                value={field.fontWeight.toString()}
                onChange={(e) => update({ fontWeight: parseInt(e.target.value) || 400 })}
                options={[100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => ({ value: w.toString(), label: w.toString() }))}
              />

              <Input
                label="Letter Spacing"
                type="number"
                value={field.letterSpacing || 0}
                onChange={(e) =>
                  update({ letterSpacing: parseFloat(e.target.value) || 0 })
                }
                step={0.1}
              />
            </div>

            {/* Style toggles row */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-primary">Style</span>
              <div className="flex gap-1">
                <ToggleButton
                  active={field.italic}
                  onClick={() => update({ italic: !field.italic })}
                  label="I"
                  className="italic"
                />
                <ToggleButton
                  active={field.underline}
                  onClick={() => update({ underline: !field.underline })}
                  label="U"
                  className="underline"
                />
              </div>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-primary">Color</span>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={field.color}
                  onChange={(e) => update({ color: e.target.value })}
                  className="w-8 h-8 rounded-[var(--radius-sm)] border border-border cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={field.color}
                  onChange={(e) => update({ color: e.target.value })}
                  className="flex-1 px-2 py-1 text-xs font-mono bg-surface border border-border rounded-[var(--radius-sm)] focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Alignment */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-text-primary">Alignment</span>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <ToggleButton
                    key={align}
                    active={field.align === align}
                    onClick={() => update({ align })}
                    label={align === 'left' ? '←' : align === 'center' ? '↔' : '→'}
                  />
                ))}
              </div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="X"
                type="number"
                value={Math.round(field.x)}
                onChange={(e) => update({ x: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Y"
                type="number"
                value={Math.round(field.y)}
                onChange={(e) => update({ y: parseInt(e.target.value) || 0 })}
              />
            </div>
          </>
        )}

        {/* ── Image-specific properties ── */}
        {isImageField(field) && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Width"
                type="number"
                value={field.width}
                onChange={(e) =>
                  update({ width: parseInt(e.target.value) || 50 })
                }
                min={20}
              />
              <Input
                label="Height"
                type="number"
                value={field.height}
                onChange={(e) =>
                  update({ height: parseInt(e.target.value) || 50 })
                }
                min={20}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="X"
                type="number"
                value={Math.round(field.x)}
                onChange={(e) => update({ x: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Y"
                type="number"
                value={Math.round(field.y)}
                onChange={(e) => update({ y: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Corner Radius */}
            <div className="pt-2">
              <Input
                label="Corner Radius (px)"
                type="number"
                value={field.cornerRadius || 0}
                onChange={(e) => update({ cornerRadius: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>

            {/* Crop toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-primary">
                Enable Cropping
              </span>
              <button
                onClick={() => update({ crop: !field.crop })}
                className={[
                  'relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer',
                  field.crop ? 'bg-accent' : 'bg-border-strong',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white',
                    'transition-transform duration-200',
                    field.crop ? 'translate-x-4' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>
          </>
        )}

        {/* Common: Shadow & Layer */}
        <div className="pt-3 border-t border-border space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-primary">
              Drop Shadow
            </span>
            <button
              onClick={() => update({ shadow: !field.shadow })}
              className={[
                'relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer',
                field.shadow ? 'bg-accent' : 'bg-border-strong',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white',
                  'transition-transform duration-200',
                  field.shadow ? 'translate-x-4' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={onSendToBack}>
              Send to Back
            </Button>
            <Button variant="secondary" size="sm" className="flex-1" onClick={onBringToFront}>
              Bring to Front
            </Button>
          </div>
        </div>

        {/* Delete */}
        <div className="pt-3 border-t border-border">
          <Button
            variant="danger"
            size="sm"
            className="w-full"
            onClick={() => onDelete(field.id)}
          >
            Delete Field
          </Button>
        </div>
      </div>
    </Panel>
  );
}

/* ── Toggle button for bold/italic/underline/alignment ── */

function ToggleButton({
  active,
  onClick,
  label,
  className = '',
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-8 h-8 flex items-center justify-center text-sm rounded-[var(--radius-sm)]',
        'transition-colors duration-150 press-feedback cursor-pointer',
        active
          ? 'bg-accent text-white'
          : 'bg-surface-elevated text-text-secondary hover:text-text-primary',
        className,
      ].join(' ')}
    >
      {label}
    </button>
  );
}
