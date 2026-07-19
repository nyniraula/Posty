import { type Field, isTextField, isImageField } from '../../types/template';
import { Input } from '../ui/Input';

interface DynamicFormProps {
  fields: Field[];
  values: Record<string, string>;
  onTextChange: (fieldId: string, value: string) => void;
  onImageChange: (fieldId: string, file: File) => void;
  imageFiles: Record<string, string>; /* fieldId -> dataURL preview */
}

export function DynamicForm({
  fields,
  values,
  onTextChange,
  onImageChange,
  imageFiles,
}: DynamicFormProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        if (isTextField(field)) {
          return (
            <Input
              key={field.id}
              label={field.label}
              value={values[field.id] || ''}
              onChange={(e) => onTextChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          );
        }

        if (isImageField(field)) {
          return (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-primary">
                {field.label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-[#E9ECEF] file:text-gray-700 hover:file:bg-gray-300"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageChange(field.id, file);
                  }}
                />
              </div>
              {field.crop && (
                <span className="text-xs text-text-tertiary">
                  Cropping will be available after selecting an image
                </span>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
