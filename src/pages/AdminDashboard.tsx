import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTemplates, deleteTemplate, isAuthenticated, logout } from '../api';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { showToast } from '../components/ui/Toast';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin', { replace: true });
      return;
    }
    loadTemplates();
  }, [navigate]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/admin/builder');
  };

  const handleLogout = async () => {
    await logout();
    showToast('Logged out', 'success');
    navigate('/admin', { replace: true });
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteTemplate(deletingId);
      setTemplates((prev) => prev.filter((t) => t.id !== deletingId));
      showToast('Template deleted', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-1">Manage your poster templates</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
            <Button onClick={handleCreateNew}>Create New Template</Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-text-secondary">
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-[var(--radius-xl)] bg-surface text-center px-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">No templates yet</h3>
            <p className="text-text-secondary mb-6 max-w-sm">
              You haven't created any poster templates. Start by building your first one!
            </p>
            <Button onClick={handleCreateNew}>Create New Template</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => navigate(`/admin/builder/${template.id}`)}
                className="group relative bg-surface border border-border rounded-[var(--radius-lg)] p-5 cursor-pointer transition-all hover:border-accent hover:shadow-lg flex flex-col justify-between aspect-square"
              >
                <div>
                  <h3 className="text-lg font-bold text-text-primary truncate mb-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {template.width} x {template.height}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] text-text-muted">
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => confirmDelete(e, template.id)}
                    className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    title="Delete template"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
