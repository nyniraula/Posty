import { useState, useCallback } from 'react';
import {
  type Template,
  type Field,
  type TextField,
  type ImageField,
  type ToolMode,
  DEFAULT_TEXT_FIELD,
  DEFAULT_IMAGE_FIELD,
} from '../types/template';

let fieldCounter = 0;

function generateFieldId(prefix: string): string {
  return `${prefix}_${++fieldCounter}`;
}

interface BuilderState {
  template: Template;
  selectedFieldId: string | null;
  activeTool: ToolMode;
}

export function useTemplateBuilder(initial?: Partial<Template>) {
  const [state, setState] = useState<BuilderState>({
    template: {
      name: initial?.name || '',
      background: initial?.background || '',
      width: initial?.width || 1080,
      height: initial?.height || 1350,
      fields: initial?.fields || [],
      ...initial,
    },
    selectedFieldId: null,
    activeTool: 'select',
  });

  const { template, selectedFieldId, activeTool } = state;

  const selectedField = template.fields.find((f) => f.id === selectedFieldId) || null;

  /* ── Template metadata ── */

  const setTemplateMeta = useCallback(
    (meta: Partial<Pick<Template, 'name' | 'background' | 'width' | 'height'>>) => {
      setState((s) => ({
        ...s,
        template: { ...s.template, ...meta },
      }));
    },
    []
  );

  /* ── Tool selection ── */

  const setTool = useCallback((tool: ToolMode) => {
    setState((s) => ({ ...s, activeTool: tool }));
  }, []);

  /* ── Field CRUD ── */

  const addTextField = useCallback((x: number, y: number) => {
    const field: TextField = {
      ...DEFAULT_TEXT_FIELD,
      id: generateFieldId('text'),
      x,
      y,
    };

    setState((s) => ({
      ...s,
      template: { ...s.template, fields: [...s.template.fields, field] },
      selectedFieldId: field.id,
      activeTool: 'select',
    }));

    return field;
  }, []);

  const addImageField = useCallback(
    (x: number, y: number, width?: number, height?: number) => {
      const field: ImageField = {
        ...DEFAULT_IMAGE_FIELD,
        id: generateFieldId('image'),
        x,
        y,
        width: width || DEFAULT_IMAGE_FIELD.width,
        height: height || DEFAULT_IMAGE_FIELD.height,
      };

      setState((s) => ({
        ...s,
        template: { ...s.template, fields: [...s.template.fields, field] },
        selectedFieldId: field.id,
        activeTool: 'select',
      }));

      return field;
    },
    []
  );

  const updateField = useCallback((id: string, updates: Partial<Field>) => {
    setState((s) => ({
      ...s,
      template: {
        ...s.template,
        fields: s.template.fields.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ) as Field[],
      },
    }));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setState((s) => {
      const idx = s.template.fields.findIndex((f) => f.id === id);
      if (idx === -1 || idx === s.template.fields.length - 1) return s;
      const fields = [...s.template.fields];
      const [field] = fields.splice(idx, 1);
      fields.push(field);
      return { ...s, template: { ...s.template, fields } };
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    setState((s) => {
      const idx = s.template.fields.findIndex((f) => f.id === id);
      if (idx <= 0) return s;
      const fields = [...s.template.fields];
      const [field] = fields.splice(idx, 1);
      fields.unshift(field);
      return { ...s, template: { ...s.template, fields } };
    });
  }, []);

  const deleteField = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      template: {
        ...s.template,
        fields: s.template.fields.filter((f) => f.id !== id),
      },
      selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
    }));
  }, []);

  const selectField = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedFieldId: id }));
  }, []);

  /* ── Load full template (for editing existing) ── */

  const loadTemplate = useCallback((tpl: Template) => {
    setState({
      template: tpl,
      selectedFieldId: null,
      activeTool: 'select',
    });
  }, []);

  return {
    template,
    selectedFieldId,
    selectedField,
    activeTool,
    setTemplateMeta,
    setTool,
    addTextField,
    addImageField,
    updateField,
    deleteField,
    selectField,
    loadTemplate,
    bringToFront,
    sendToBack,
  };
}
