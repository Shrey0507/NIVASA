import { useCallback, useEffect, useState } from "react";
import { Copy, Key, Plus, RefreshCw, Search } from "lucide-react";

import { createCredential, getCredentials, resetPassword } from "@/services/credentialService";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const ALL = "all";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

export default function CredentialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [hostel, setHostel] = useState(ALL);
  const [showAdd, setShowAdd] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetResult, setResetResult] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCredentials({
        search,
        hostel: hostel === ALL ? "" : hostel,
      });
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, hostel]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmReset = async () => {
    if (!resetTarget) return;
    const result = await resetPassword(resetTarget.id);
    setResetResult(result);
    setResetTarget(null);
    load();
  };

  return (
    <>
      <PageHeader
        title="Credentials"
        description="Manage login access for residents."
      >
        <Button onClick={() => setShowAdd(true)}>
          <Plus /> Create credential
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or USN..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={hostel} onValueChange={setHostel}>
          <SelectTrigger className="sm:w-[170px]">
            <SelectValue placeholder="Hostel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All hostels</SelectItem>
            <SelectItem value="boys">Boys' Hostel</SelectItem>
            <SelectItem value="girls">Girls' Hostel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to load credentials"
          description={error}
          action={
            <Button variant="outline" onClick={load}>
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Key}
          title="No credentials found"
          description="Create login credentials for residents."
          action={
            <Button onClick={() => setShowAdd(true)}>
              <Plus /> Create credential
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <div className="grid gap-2 p-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{c.fullName}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {c.usn}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {c.hostelType === "boys" ? "Boys" : "Girls"}
                  </span>
                </div>
                <div className="rounded bg-muted/50 px-2 py-1.5 font-mono text-xs">
                  {c.username}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last login: {formatDate(c.lastLogin)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResetTarget(c)}
                >
                  <RefreshCw /> Reset password
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddCredentialDialog
        open={showAdd}
        onClose={(saved) => {
          setShowAdd(false);
          if (saved) load();
        }}
      />

      {resetTarget && (
        <ConfirmDialog
          title="Reset password"
          description={
            <>
              <p>
                Generate a new password for{" "}
                <strong>{resetTarget.fullName}</strong> ({resetTarget.usn}).
              </p>
              <p className="mt-2 text-muted-foreground">
                A fresh password will be shown once. Share it securely with the
                resident.
              </p>
            </>
          }
          confirmLabel="Generate new password"
          onConfirm={confirmReset}
          onCancel={() => setResetTarget(null)}
        />
      )}

      {resetResult && (
        <Dialog open={!!resetResult} onOpenChange={() => setResetResult(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Password reset</DialogTitle>
              <DialogDescription>
                New password for {resetResult.fullName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                <code className="flex-1 font-mono text-sm">{resetResult.newPassword}</code>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => copyToClipboard(resetResult.newPassword)}
                >
                  <Copy />
                </Button>
              </div>
              <p className="text-xs text-destructive">
                This password is shown only once.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setResetResult(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function AddCredentialDialog({ open, onClose }) {
  const [form, setForm] = useState({
    fullName: "",
    usn: "",
    hostelType: "boys",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({ fullName: "", usn: "", hostelType: "boys" });
      setError("");
      setResult(null);
    }
  }, [open]);

  if (!open) return null;

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.usn.trim()) {
      setError("Name and USN are required");
      return;
    }
    try {
      setSaving(true);
      const created = await createCredential(form);
      setResult(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (result) onClose(true);
    else onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create credential</DialogTitle>
          <DialogDescription>
            Generate login access for a resident.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <p className="text-sm">
              Credential created for <strong>{result.fullName}</strong>. Share
              these details:
            </p>
            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Username</span>
                <code className="font-mono text-sm">{result.username}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Password</span>
                <code className="font-mono text-sm">{result.password}</code>
              </div>
            </div>
            <p className="text-xs text-destructive">
              These are shown only once. Copy them now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>USN</Label>
              <Input
                value={form.usn}
                onChange={(e) => update("usn", e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label>Hostel</Label>
              <Select
                value={form.hostelType}
                onValueChange={(v) => update("hostelType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys">Boys' Hostel</SelectItem>
                  <SelectItem value="girls">Girls' Hostel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Creating..." : "Create credential"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}