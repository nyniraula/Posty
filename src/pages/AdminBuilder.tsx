import { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAuthenticated, fetchTemplate, createTemplate, updateTemplate } from '../api';
import { useTemplateBuilder } from '../hooks/useTemplateBuilder';
import { Canvas } from '../components/builder/Canvas';
import { Toolbar } from '../components/builder/Toolbar';
import { PropertyPanel } from '../components/builder/PropertyPanel';
import { TemplateMetaForm } from '../components/builder/TemplateMetaForm';
import { Button } from '../components/ui/Button';
import { showToast } from '../components/ui/Toast';

export function AdminBuilder() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId?: string }>();

  const {
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
  } = useTemplateBuilder();

  /* ── Auth gate ── */
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  /* ── Load existing template ── */
  useEffect(() => {
    if (!templateId) return;

    fetchTemplate(templateId)
      .then((data) => loadTemplate(data))
      .catch(() => {
        showToast('Template not found', 'error');
        navigate('/admin/builder', { replace: true });
      });
  }, [templateId, loadTemplate, navigate]);

  /* ── Save handler ── */
  const handleSave = useCallback(async () => {
    if (!template.name) {
      showToast('Please enter a template name', 'error');
      return;
    }
    if (!template.background) {
      showToast('Please enter a background image URL', 'error');
      return;
    }

    try {
      let savedId = template.id;
      if (template.id) {
        await updateTemplate(template.id, {
          name: template.name,
          background: template.background,
          width: template.width,
          height: template.height,
          fields: template.fields,
        });
      } else {
        const { id } = await createTemplate({
          name: template.name,
          background: template.background,
          width: template.width,
          height: template.height,
          fields: template.fields,
        });
        savedId = id;
        navigate(`/admin/builder/${id}`, { replace: true });
      }

      if (savedId) {
        const shareUrl = `${window.location.origin}/${savedId}`;
        await navigator.clipboard.writeText(shareUrl).catch(() => {});
        showToast('Template saved & link copied to clipboard!', 'success');
      }
    } catch {
      showToast('Failed to save template', 'error');
    }
  }, [template, navigate]);

  /* ── Field add handler ── */
  const handleFieldAdd = useCallback(
    (type: 'text' | 'image', x: number, y: number, w?: number, h?: number) => {
      if (type === 'text') {
        addTextField(x, y);
      } else {
        addImageField(x, y, w, h);
      }
    },
    [addTextField, addImageField]
  );

  /* ── New template ── */
  const handleNew = useCallback(() => {
    navigate('/admin/builder', { replace: true });
    /* Force reload to reset state */
    window.location.reload();
  }, [navigate]);

  /* ── Share URL ── */
  const shareUrl = template.id
    ? `${window.location.origin}/${template.id}`
    : null;

  return (
    <div className="h-[100dvh] flex flex-col bg-canvas">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border h-[52px] shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Button>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <span className="text-xs text-text-tertiary font-medium">
            {template.name || 'New Template'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {shareUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                showToast('Share link copied', 'success');
              }}
            >
              Copy Link
            </Button>
          )}
          <Button size="sm" onClick={handleSave}>
            Save Template
          </Button>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <Toolbar activeTool={activeTool} onToolChange={setTool} />

      {/* ── Main area ── */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar: template meta */}
        <div className="w-[260px] shrink-0 bg-surface border-r border-border overflow-y-auto p-4 space-y-6">
          <TemplateMetaForm
              name={template.name}
              background={template.background}
              width={template.width}
              height={template.height}
              onChange={setTemplateMeta}
            />
        </div>

        {/* Canvas */}
        <Canvas
          width={template.width}
          height={template.height}
          backgroundUrl={template.background}
          fields={template.fields}
          selectedFieldId={selectedFieldId}
          activeTool={activeTool}
          onFieldSelect={selectField}
          onFieldAdd={handleFieldAdd}
          onFieldUpdate={updateField}
          onTemplateResize={(w, h) => setTemplateMeta({ width: w, height: h })}
        />

        {/* Right sidebar: properties */}
        <div className="w-[280px] shrink-0">
          <PropertyPanel
            field={selectedField}
            onUpdate={updateField}
            onDelete={deleteField}
            onBringToFront={() => selectedFieldId && bringToFront(selectedFieldId)}
            onSendToBack={() => selectedFieldId && sendToBack(selectedFieldId)}
          />
        </div>
      </div>
    </div>
  );
}
