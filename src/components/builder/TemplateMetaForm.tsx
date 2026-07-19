import { useState, useRef } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { showToast } from '../ui/Toast';
import { uploadImage } from '../../api';

interface TemplateMetaFormProps {
  name: string;
  background: string;
  width: number;
  height: number;
  onChange: (meta: {
    name?: string;
    background?: string;
    width?: number;
    height?: number;
  }) => void;
}

export function TemplateMetaForm({
  name,
  background,
  width,
  height,
  onChange,
}: TemplateMetaFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      onChange({ background: url });
      showToast('Image uploaded successfully', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <Input
        label="Template Name"
        value={name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Employee Banner"
      />
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-text-primary block">
          Background Image
        </span>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        <Button
          variant="secondary"
          className="w-full justify-center"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        {background && (
          <div className="text-[10px] text-text-secondary truncate mt-1">
            Current: {background}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Width (px)"
          type="number"
          value={width}
          onChange={(e) => onChange({ width: parseInt(e.target.value) || 0 })}
          min={100}
        />
        <Input
          label="Height (px)"
          type="number"
          value={height}
          onChange={(e) => onChange({ height: parseInt(e.target.value) || 0 })}
          min={100}
        />
      </div>
    </div>
  );
}
