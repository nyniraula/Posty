import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect } from 'react-konva';
import Konva from 'konva';
import { type Field, isTextField, isImageField } from '../../types/template';

interface PosterPreviewProps {
  width: number;
  height: number;
  backgroundUrl: string;
  fields: Field[];
  textValues: Record<string, string>;
  imageValues: Record<string, string>; /* fieldId -> dataURL or cropped URL */
  stageRef?: React.RefObject<Konva.Stage | null>;
}

export function PosterPreview({
  width,
  height,
  backgroundUrl,
  fields,
  textValues,
  imageValues,
  stageRef: externalStageRef,
}: PosterPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalStageRef = useRef<Konva.Stage>(null);
  const activeStageRef = externalStageRef || internalStageRef;

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [fieldImages, setFieldImages] = useState<
    Record<string, HTMLImageElement>
  >({});
  const [scale, setScale] = useState(1);

  /* ── Load background ── */
  useEffect(() => {
    if (!backgroundUrl) {
      setBgImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = backgroundUrl;
    img.onload = () => setBgImage(img);
    img.onerror = () => setBgImage(null);
  }, [backgroundUrl]);

  /* ── Load field images ── */
  useEffect(() => {
    const entries = Object.entries(imageValues);
    if (entries.length === 0) {
      setFieldImages({});
      return;
    }

    const loaded: Record<string, HTMLImageElement> = {};
    let count = 0;

    entries.forEach(([fieldId, src]) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        loaded[fieldId] = img;
        count++;
        if (count === entries.length) {
          setFieldImages({ ...loaded });
        }
      };
      img.onerror = () => {
        count++;
        if (count === entries.length) {
          setFieldImages({ ...loaded });
        }
      };
    });
  }, [imageValues]);

  /* ── Fit to container ── */
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const scaleX = container.clientWidth / width;
      const scaleY = container.clientHeight / height;
      setScale(Math.min(scaleX, scaleY, 1));
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center bg-[#F0F0EE] rounded-[var(--radius-lg)] overflow-hidden"
      style={{ minHeight: 300 }}
    >
      <Stage
        ref={activeStageRef}
        width={width * scale}
        height={height * scale}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
          {/* Background */}
          {bgImage ? (
            <KonvaImage image={bgImage} width={width} height={height} />
          ) : (
            <Rect width={width} height={height} fill="#E5E5E3" />
          )}

          {/* Render fields */}
          {fields.map((field) => {
            if (isTextField(field)) {
              const displayText = textValues[field.id] || field.label;
              return (
                <Text
                  key={field.id}
                  x={field.x}
                  y={field.y}
                  text={displayText}
                  fontFamily={field.fontFamily}
                  fontSize={field.fontSize}
                  fontStyle={[
                    field.fontWeight ? field.fontWeight.toString() : '400',
                    field.italic ? 'italic' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  textDecoration={field.underline ? 'underline' : ''}
                  letterSpacing={field.letterSpacing || 0}
                  fill={field.color}
                  align={field.align}
                  shadowColor="rgba(0,0,0,0.5)"
                  shadowBlur={10}
                  shadowOffset={{ x: 0, y: 4 }}
                  shadowOpacity={field.shadow ? 1 : 0}
                  listening={false}
                />
              );
            }

            if (isImageField(field)) {
              const fieldImg = fieldImages[field.id];
              if (fieldImg) {
                return (
                  <KonvaImage
                    key={field.id}
                    image={fieldImg}
                    x={field.x}
                    y={field.y}
                    width={field.width}
                    height={field.height}
                    shadowColor="rgba(0,0,0,0.5)"
                    shadowBlur={10}
                    shadowOffset={{ x: 0, y: 4 }}
                    shadowOpacity={field.shadow ? 1 : 0}
                    cornerRadius={field.cornerRadius || 0}
                    listening={false}
                  />
                );
              }

              /* Placeholder */
              return (
                <Rect
                  key={field.id}
                  x={field.x}
                  y={field.y}
                  width={field.width}
                  height={field.height}
                  fill="rgba(0,0,0,0.08)"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth={1}
                  dash={[4, 4]}
                  cornerRadius={field.cornerRadius || 0}
                  listening={false}
                />
              );
            }

            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}
