import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { type Field, type ToolMode, isTextField, isImageField } from '../../types/template';

interface CanvasProps {
  width: number;
  height: number;
  backgroundUrl: string;
  fields: Field[];
  selectedFieldId: string | null;
  activeTool: ToolMode;
  onFieldSelect: (id: string | null) => void;
  onFieldAdd: (type: 'text' | 'image', x: number, y: number, w?: number, h?: number) => void;
  onFieldUpdate: (id: string, updates: Partial<Field>) => void;
  onTemplateResize?: (width: number, height: number) => void;
}

export function Canvas({
  width,
  height,
  backgroundUrl,
  fields,
  selectedFieldId,
  activeTool,
  onFieldSelect,
  onFieldAdd,
  onFieldUpdate,
  onTemplateResize,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  /* ── Load background image ── */
  useEffect(() => {
    if (!backgroundUrl) {
      setBgImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = backgroundUrl;
    img.onload = () => {
      setBgImage(img);
      if (onTemplateResize) {
        onTemplateResize(img.naturalWidth, img.naturalHeight);
      }
    };
    img.onerror = () => setBgImage(null);
  }, [backgroundUrl]);

  /* ── Fit canvas to container ── */
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

  /* ── Attach transformer to selected node ── */
  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    if (selectedFieldId) {
      const selectedField = fields.find((f) => f.id === selectedFieldId);
      if (selectedField) {
        const node = stage.findOne(`#${selectedFieldId}`);
        if (node) {
          tr.nodes([node]);
          tr.getLayer()?.batchDraw();
          return;
        }
      }
    }

    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedFieldId, fields]);

  /* ── Stage click handler ── */
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      /* Convert from scaled to canvas coordinates */
      const canvasX = pos.x / scale;
      const canvasY = pos.y / scale;

      /* Click on empty area */
      if (e.target === e.target.getStage() || e.target.name() === 'background') {
        if (activeTool === 'text') {
          onFieldAdd('text', canvasX, canvasY);
        } else if (activeTool === 'select') {
          onFieldSelect(null);
        }
        return;
      }
    },
    [activeTool, scale, onFieldAdd, onFieldSelect]
  );

  /* ── Mouse down for image drag-to-create ── */
  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'image') return;
      if (e.target !== e.target.getStage() && e.target.name() !== 'background') return;

      const stage = stageRef.current;
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      const startPos = { x: pos.x / scale, y: pos.y / scale };
      setDragStart(startPos);
      setDragCurrent(startPos);
    },
    [activeTool, scale]
  );

  const handleStageMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'image' || !dragStart) return;

      const stage = stageRef.current;
      const pos = stage?.getPointerPosition();
      if (!pos) {
        setDragStart(null);
        setDragCurrent(null);
        return;
      }

      const endX = pos.x / scale;
      const endY = pos.y / scale;
      const w = Math.abs(endX - dragStart.x);
      const h = Math.abs(endY - dragStart.y);
      const x = Math.min(dragStart.x, endX);
      const y = Math.min(dragStart.y, endY);

      /* Minimum size threshold */
      if (w > 20 && h > 20) {
        onFieldAdd('image', x, y, w, h);
      } else {
        /* Click without dragging: create default size */
        onFieldAdd('image', dragStart.x, dragStart.y);
      }

      setDragStart(null);
      setDragCurrent(null);
    },
    [activeTool, dragStart, scale, onFieldAdd]
  );

  const handleStageMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool !== 'image' || !dragStart) return;
      const stage = stageRef.current;
      const pos = stage?.getPointerPosition();
      if (!pos) return;
      setDragCurrent({ x: pos.x / scale, y: pos.y / scale });
    },
    [activeTool, dragStart, scale]
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-[#2A2A2A] overflow-hidden"
    >
      <Stage
        ref={stageRef}
        width={width * scale}
        height={height * scale}
        scaleX={scale}
        scaleY={scale}
        onClick={handleStageClick}
        onMouseDown={handleStageMouseDown}
        onMouseUp={handleStageMouseUp}
        onMouseMove={handleStageMouseMove}
        style={{
          border: '1px solid rgba(255,255,255,0.1)',
          cursor:
            activeTool === 'text'
              ? 'crosshair'
              : activeTool === 'image'
              ? 'crosshair'
              : 'default',
        }}
      >
        <Layer>
          {/* Background */}
          {bgImage ? (
            <KonvaImage
              image={bgImage}
              width={width}
              height={height}
              name="background"
              listening={true}
            />
          ) : (
            <Rect
              width={width}
              height={height}
              fill="#E5E5E3"
              name="background"
              listening={true}
            />
          )}

          {/* Fields */}
          {fields.map((field) => {
            if (isTextField(field)) {
              return (
                <Text
                  key={field.id}
                  id={field.id}
                  x={field.x}
                  y={field.y}
                  text={field.label}
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
                  draggable
                  onClick={() => onFieldSelect(field.id)}
                  onTap={() => onFieldSelect(field.id)}
                  onDragEnd={(e) => {
                    onFieldUpdate(field.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    node.scaleX(1);
                    node.scaleY(1);
                    onFieldUpdate(field.id, {
                      x: node.x(),
                      y: node.y(),
                      fontSize: Math.max(8, Math.round(field.fontSize * scaleX)),
                    });
                  }}
                />
              );
            }

            if (isImageField(field)) {
              return (
                <Group
                  key={field.id}
                  id={field.id}
                  x={field.x}
                  y={field.y}
                  shadowColor="rgba(0,0,0,0.5)"
                  shadowBlur={10}
                  shadowOffset={{ x: 0, y: 4 }}
                  shadowOpacity={field.shadow ? 1 : 0}
                  draggable
                  onClick={() => onFieldSelect(field.id)}
                  onTap={() => onFieldSelect(field.id)}
                  onDragEnd={(e) => {
                    onFieldUpdate(field.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);

                    onFieldUpdate(field.id, {
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(20, field.width * scaleX),
                      height: Math.max(20, field.height * scaleY),
                    });
                  }}
                >
                  {/* Placeholder rectangle */}
                  <Rect
                    width={field.width}
                    height={field.height}
                    fill="rgba(255,255,255,0.15)"
                    stroke={selectedFieldId === field.id ? '#2563EB' : 'rgba(255,255,255,0.4)'}
                    strokeWidth={selectedFieldId === field.id ? 2 : 1}
                    dash={selectedFieldId === field.id ? undefined : [6, 4]}
                    cornerRadius={field.cornerRadius || 0}
                  />
                  {/* Label */}
                  <Text
                    text={field.label}
                    width={field.width}
                    height={field.height}
                    align="center"
                    verticalAlign="middle"
                    fontSize={14}
                    fill="rgba(255,255,255,0.7)"
                    listening={false}
                  />
                </Group>
              );
            }

            return null;
          })}

          {/* Drag Visualizer */}
          {dragStart && dragCurrent && (
            <Rect
              x={Math.min(dragStart.x, dragCurrent.x)}
              y={Math.min(dragStart.y, dragCurrent.y)}
              width={Math.abs(dragCurrent.x - dragStart.x)}
              height={Math.abs(dragCurrent.y - dragStart.y)}
              fill="rgba(0, 168, 255, 0.15)"
              stroke="#00a8ff"
              strokeWidth={2 / scale}
              dash={[5 / scale, 5 / scale]}
            />
          )}

          {/* Transformer for resize */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 20 || newBox.height < 20) return oldBox;
              return newBox;
            }}
            anchorSize={8}
            anchorCornerRadius={2}
            borderStroke="#2563EB"
            anchorStroke="#2563EB"
            anchorFill="#FFFFFF"
          />
        </Layer>
      </Stage>
    </div>
  );
}
