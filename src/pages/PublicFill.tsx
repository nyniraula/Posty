import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Konva from 'konva';
import { fetchTemplate } from '../api';
import { type Template, isImageField } from '../types/template';
import { DynamicForm } from '../components/fill/DynamicForm';
import { PosterPreview } from '../components/fill/PosterPreview';
import { ImageCropper } from '../components/fill/ImageCropper';
import { Button } from '../components/ui/Button';
import { loadPosterFonts } from '../utils/fonts';

export function PublicFill() {
  const { templateId } = useParams<{ templateId: string }>();
  const stageRef = useRef<Konva.Stage>(null);

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [imageValues, setImageValues] = useState<Record<string, string>>({});

  /* Image cropper state */
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState('');
  const [cropperFieldId, setCropperFieldId] = useState('');
  const [cropperDimensions, setCropperDimensions] = useState({
    width: 200,
    height: 200,
  });

  /* ── Load template ── */
  useEffect(() => {
    if (!templateId) return;

    async function load() {
      try {
        await loadPosterFonts();
        const data = await fetchTemplate(templateId!);
        setTemplate(data);
      } catch {
        setError('Template not found');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [templateId]);

  /* ── Text change ── */
  const handleTextChange = useCallback((fieldId: string, value: string) => {
    setTextValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  /* ── Image change ── */
  const handleImageChange = useCallback(
    (fieldId: string, file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const field = template?.fields.find((f) => f.id === fieldId);

        if (field && isImageField(field) && field.crop) {
          /* Open cropper */
          setCropperFieldId(fieldId);
          setCropperSrc(dataUrl);
          setCropperDimensions({
            width: field.width,
            height: field.height,
          });
          setCropperOpen(true);
        } else {
          setImageValues((prev) => ({ ...prev, [fieldId]: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    },
    [template]
  );

  /* ── Cropper confirm ── */
  const handleCropConfirm = useCallback(
    (croppedDataUrl: string) => {
      setImageValues((prev) => ({
        ...prev,
        [cropperFieldId]: croppedDataUrl,
      }));
      setCropperOpen(false);
    },
    [cropperFieldId]
  );

  /* ── Download ── */
  const handleDownload = useCallback(() => {
    if (!stageRef.current || !template) return;

    /* Render at full resolution */
    const dataUrl = stageRef.current.toDataURL({
      pixelRatio: 1 / (stageRef.current.scaleX() || 1),
      mimeType: 'image/png',
    });

    const link = document.createElement('a');
    link.download = `${template.name || 'poster'}.png`;
    link.href = dataUrl;
    link.click();
  }, [template]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-canvas">
        <p className="text-sm text-text-secondary">Loading template...</p>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !template) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-canvas">
        <div className="text-center space-y-2">
          <p className="text-sm text-danger font-medium">
            {error || 'Something went wrong'}
          </p>
          <p className="text-xs text-text-tertiary">
            Check the template ID and try again
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-canvas">
      {/* Main content */}
      <main className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-center text-text-primary mb-8 tracking-tight">
          Poster Generator
        </h1>

        <div className="space-y-6">
          <DynamicForm
            fields={template.fields}
            values={textValues}
            onTextChange={handleTextChange}
            onImageChange={handleImageChange}
            imageFiles={imageValues}
          />
        </div>

        <hr className="my-8 border-t border-border" />

        <div className="text-center mb-4">
          <span className="text-sm font-medium text-text-secondary">Live Preview</span>
        </div>

        <PosterPreview
          width={template.width}
          height={template.height}
          backgroundUrl={template.background}
          fields={template.fields}
          textValues={textValues}
          imageValues={imageValues}
          stageRef={stageRef}
        />

        <hr className="my-8 border-t border-border" />

        <div className="flex justify-center pb-8">
          <Button size="lg" className="px-8 bg-[#1B64F2] text-white hover:bg-blue-700 font-medium" onClick={handleDownload}>
            Download Poster
          </Button>
        </div>
      </main>

      {/* Image cropper modal */}
      <ImageCropper
        open={cropperOpen}
        imageSrc={cropperSrc}
        targetWidth={cropperDimensions.width}
        targetHeight={cropperDimensions.height}
        onConfirm={handleCropConfirm}
        onCancel={() => setCropperOpen(false)}
      />
    </div>
  );
}
