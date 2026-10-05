import { useState, useEffect, useCallback } from 'react';
import AdminHeader from '../../components/layout/AdminHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  listCredentials, getEligibleStudents, createCredential,
  resetPassword, setCredentialStatus, revokeCredential
} from '../../services/credentialService';

// ─── Password strength helper ───────────────────────────────────────────────
const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#16a34a'];
  return { score, label: labels[score] || '', color: colors[score] || '' };
};

// ─── Eye/EyeOff icons ────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// PasswordInput is exported for future use in a set-password dialog (backend integration pending)
export const PasswordInput = ({ value, onChange, placeholder, id, showStrength = false }) => {
  const [show, setShow] = useState(false);
  const strength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div>
      <div className="password-input-wrapper">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="form-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {showStrength && value && (
        <div className="password-strength">
          <div className="password-strength-bar">
            <div
              className="password-strength-fill"
              style={{
                width: `${(strength.score / 5) * 100}%`,
                backgroundColor: strength.color,
              }}
            />
          </div>
          <span className="password-strength-label" style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Format date ─────────────────────────────────────────────────────────────
const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

// ═══════════════════════════════════════════════════════════════════════════════
// CredentialsPage
// ═══════════════════════════════════════════════════════════════════════════════
const CredentialsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });

  // Dialogs
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState(null); // credential to reset
  const [toggleTarget, setToggleTarget] = useState(null); // credential to suspend/activate
  const [revokeTarget, setRevokeTarget] = useState(null); // credential to revoke
  const [secret, setSecret] = useState(null); // { username, tempPassword }

  // Per-action loading/error state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await listCredentials(filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect

  const handleReset = (c) => {
    setResetTarget(c);
    setActionError('');
  };

  const handleResetConfirm = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      const r = await resetPassword(resetTarget.id);
      setSecret({ username: r.credential.username, tempPassword: r.tempPassword });
      setResetTarget(null);
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = (c) => {
    setToggleTarget(c);
    setActionError('');
  };

  const handleToggleConfirm = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      await setCredentialStatus(toggleTarget.id, toggleTarget.status === 'active' ? 'suspended' : 'active');
      setToggleTarget(null);
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = (c) => {
    setRevokeTarget(c);
    setActionError('');
  };

  const handleRevokeConfirm = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      await revokeCredential(revokeTarget.id);
      setRevokeTarget(null);
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <AdminHeader title="Credentials" />
      <div className="admin-content">
        <div className="actions-bar">
          <div>
            <h1 className="page-title">Credential Manager</h1>
            <p className="page-subtitle">Manage resident portal access. Admin only.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            Create Credential
          </button>
        </div>

        <div className="info-banner" style={{ marginBottom: '1.5rem' }}>
          Credentials are managed through a mock service layer. Replace <code>credentialService.js</code> with your backend authentication provider (Firebase Auth, Supabase, REST API) without changing this page.
        </div>

        <div className="filters-bar">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by name, USN or username..."
            value={filters.search}
            onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
          />
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : error ? (
          <div className="card"><div className="card-content"><div className="empty-state">
            <p className="empty-state-title">Failed to load credentials</p>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={load} style={{ marginTop: '1rem' }}>Retry</button>
          </div></div></div>
        ) : items.length === 0 ? (
          <div className="card"><div className="card-content"><div className="empty-state">
            <p className="empty-state-title">No credentials found</p>
            <p>Create a login for a resident to get started.</p>
          </div></div></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Username</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{c.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.125rem', fontFamily: 'monospace' }}>
                        {c.usn}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{c.username}</span>
                      {c.mustChangePassword && (
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--warning))', marginTop: '0.125rem' }}>
                          Password change required
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{fmt(c.createdAt)}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                      {fmt(c.lastLogin)}
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {c.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleReset(c)}>
                          Reset password
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(c)}>
                          {c.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-danger-ghost"
                          onClick={() => handleRevoke(c)}
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Credential */}
      {showCreate && (
        <CreateDialog
          onClose={(result) => {
            setShowCreate(false);
            if (result) {
              setSecret({ username: result.credential.username, tempPassword: result.tempPassword });
              load();
            }
          }}
        />
      )}

      {/* Reset password confirmation */}
      {resetTarget && (
        <ConfirmDialog
          title="Reset Password"
          description={
            <p>
              Reset the password for <strong>{resetTarget.studentName}</strong>?
              A new temporary password will be generated and shown once.
              The resident will be required to change it on next login.
            </p>
          }
          confirmLabel="Reset Password"
          loading={actionLoading}
          error={actionError}
          onConfirm={handleResetConfirm}
          onCancel={() => setResetTarget(null)}
        />
      )}

      {/* Suspend/activate confirmation */}
      {toggleTarget && (
        <ConfirmDialog
          title={toggleTarget.status === 'active' ? 'Suspend Account' : 'Activate Account'}
          description={
            <p>
              {toggleTarget.status === 'active'
                ? <>Suspend portal access for <strong>{toggleTarget.studentName}</strong>? They will not be able to log in until reactivated.</>
                : <>Reactivate portal access for <strong>{toggleTarget.studentName}</strong>? They will be able to log in immediately.</>
              }
            </p>
          }
          confirmLabel={toggleTarget.status === 'active' ? 'Suspend' : 'Activate'}
          variant={toggleTarget.status === 'active' ? 'destructive' : 'default'}
          loading={actionLoading}
          error={actionError}
          onConfirm={handleToggleConfirm}
          onCancel={() => setToggleTarget(null)}
        />
      )}

      {/* Revoke confirmation */}
      {revokeTarget && (
        <ConfirmDialog
          title="Revoke Access"
          description={
            <>
              <p>Permanently revoke portal access for <strong>{revokeTarget.studentName}</strong> ({revokeTarget.username})?</p>
              <p style={{ marginTop: '0.75rem' }}>This deletes the login credential. To restore access, a new credential must be created.</p>
            </>
          }
          confirmLabel="Revoke Access"
          variant="destructive"
          loading={actionLoading}
          error={actionError}
          onConfirm={handleRevokeConfirm}
          onCancel={() => setRevokeTarget(null)}
        />
      )}

      {/* Secret reveal dialog */}
      {secret && <SecretDialog secret={secret} onClose={() => setSecret(null)} />}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CreateDialog
// ═══════════════════════════════════════════════════════════════════════════════
const CreateDialog = ({ onClose }) => {
  const [eligible, setEligible] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getEligibleStudents().then(setEligible).catch(e => setError(e.message));
  }, []);

  const handleSelect = (id) => {
    setStudentId(id);
    const s = eligible?.find(x => String(x.id) === id);
    setUsername(s ? s.usn.toLowerCase() : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) { setError('Select a resident'); return; }
    if (!username.trim()) { setError('Username is required'); return; }
    try {
      setSubmitting(true);
      setError('');
      onClose(await createCredential(studentId, username));
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={() => onClose(null)}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">Create Credential</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="form-group">
              <label className="form-label" htmlFor="create-resident">Resident *</label>
              <select
                id="create-resident"
                className="form-select"
                value={studentId}
                onChange={(e) => handleSelect(e.target.value)}
                disabled={!eligible}
              >
                <option value="">{eligible ? 'Choose a resident...' : 'Loading...'}</option>
                {eligible?.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} – {s.usn}</option>
                ))}
              </select>
              {eligible?.length === 0 && (
                <p className="form-error" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  All active residents already have credentials.
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="create-username">Username *</label>
              <input
                id="create-username"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="e.g. 1ms22cs001"
                autoComplete="username"
              />
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
                4–30 characters. Letters, numbers, dots, underscores, hyphens.
              </p>
            </div>
            <div className="info-banner">
              A temporary password is generated and shown once. The resident must change it at first login.
            </div>
            {error && <div className="form-error" style={{ marginTop: '0.75rem' }}>{error}</div>}
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose(null)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || (eligible && eligible.length === 0)}>
              {submitting ? 'Creating...' : 'Create Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SecretDialog — one-time credential reveal
// ═══════════════════════════════════════════════════════════════════════════════
const SecretDialog = ({ secret, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Username: ${secret.username}\nTemporary password: ${secret.tempPassword}`
      );
      setCopied(true);
    } catch {
      // Clipboard unavailable — user can select manually
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="dialog-header">
          <h2 className="dialog-title">Share These Credentials</h2>
        </div>
        <div className="dialog-body">
          <div className="secret-box">
            <div>Username: <strong>{secret.username}</strong></div>
            <div>Temporary password: <strong>{secret.tempPassword}</strong></div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.875rem', lineHeight: '1.6' }}>
            This password is shown <strong>only once</strong>. Share it securely with the resident. They will be prompted to change it on first login.
          </p>
        </div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={copy}>
            {copied ? 'Copied' : 'Copy to clipboard'}
          </button>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsPage;
