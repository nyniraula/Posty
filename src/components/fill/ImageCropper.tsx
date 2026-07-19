import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ImageCropperProps {
  open: boolean;
  imageSrc: string;
  targetWidth: number;
  targetHeight: number;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropper({
  open,
  imageSrc,
  targetWidth,
  targetHeight,
  onConfirm,
  onCancel,
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onImageLoad = useCallback(() => {
    /* Set initial crop to match target aspect ratio, centered */
    const aspect = targetWidth / targetHeight;
    const img = imgRef.current;
    if (!img) return;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let cropW: number, cropH: number;

    if (imgAspect > aspect) {
      cropH = 90;
      cropW = (cropH * aspect * img.naturalHeight) / img.naturalWidth;
    } else {
      cropW = 90;
      cropH = (cropW * img.naturalWidth) / (aspect * img.naturalHeight);
    }

    setCrop({
      unit: '%',
      width: Math.min(cropW, 100),
      height: Math.min(cropH, 100),
      x: (100 - Math.min(cropW, 100)) / 2,
      y: (100 - Math.min(cropH, 100)) / 2,
    });
  }, [targetWidth, targetHeight]);

  const handleConfirm = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      targetWidth,
      targetHeight
    );

    const dataUrl = canvas.toDataURL('image/png');
    onConfirm(dataUrl);
  }, [completedCrop, targetWidth, targetHeight, onConfirm]);

  return (
    <Modal open={open} onClose={onCancel} title="Crop Image">
      <div className="space-y-4">
        <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-surface-elevated rounded-[var(--radius-lg)]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={targetWidth / targetHeight}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop source"
              onLoad={onImageLoad}
              style={{ maxWidth: '100%', maxHeight: '55vh' }}
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm}>
            Apply Crop
          </Button>
        </div>
      </div>
    </Modal>
  );
}
