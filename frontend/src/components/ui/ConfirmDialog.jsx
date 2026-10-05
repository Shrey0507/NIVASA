/**
 * ConfirmDialog - reusable confirmation modal
 * Props:
 *   title: string
 *   description: ReactNode
 *   confirmLabel: string (default "Confirm")
 *   cancelLabel: string (default "Cancel")
 *   variant: 'destructive' | 'default'
 *   loading: boolean
 *   error: string
 *   onConfirm: () => void
 *   onCancel: () => void
 */
const ConfirmDialog = ({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  error = '',
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="dialog-overlay" onClick={!loading ? onCancel : undefined}>
      <div className="dialog-content dialog-content-sm" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
        </div>
        <div className="dialog-body">
          <div style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground))', lineHeight: '1.6' }}>
            {description}
          </div>
          {error && (
            <div className="form-error" style={{ marginTop: '1rem' }}>{error}</div>
          )}
        </div>
        <div className="dialog-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${variant === 'destructive' ? 'btn-destructive' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
