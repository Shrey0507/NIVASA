import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Send,
} from "lucide-react";

import { currentStudent } from "@/data/studentData";
import {
  getMovementRequests,
  createMovementRequest,
  cancelRequest,
} from "@/services/movementRequestService";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "warning",
    icon: Clock,
    border: "border-warning/20 bg-warning/5",
  },
  approved: {
    label: "Approved",
    variant: "success",
    icon: CheckCircle2,
    border: "border-success/20 bg-success/5",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
    border: "border-destructive/20 bg-destructive/5",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary",
    icon: Ban,
    border: "border-muted/20 bg-muted/5",
  },
};

export default function StudentMovementsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMovementRequests({
        studentId: currentStudent.id,
      });
      setRequests(data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelRequest(id, currentStudent.id);
      await load();
    } catch {
      // silently handle
    } finally {
      setCancelling(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const pastRequests = requests.filter((r) => r.status !== "pending");

  return (
    <>
      <PageHeader
        title="Movement Requests"
        description="Submit entry/exit requests and track their approval status."
      >
        <Button onClick={() => setShowNew(true)}>
          <Plus className="mr-1 size-4" />
          New Request
        </Button>
      </PageHeader>

      {/* ── Currently pending ── */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <SectionCard
              title="Pending requests"
              action={
                <Badge variant="warning">{pendingRequests.length} awaiting review</Badge>
              }
            >
              <div className="space-y-3">
                {pendingRequests.map((req) => {
                  const cfg = statusConfig[req.status];
                  return (
                    <div
                      key={req.id}
                      className={`flex items-center justify-between gap-4 rounded-lg border px-4 py-3 ${cfg.border}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {req.type === "exit" ? "Exit Request" : "Entry Request"}
                          </Badge>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                        <p className="mt-1 text-sm font-medium">{req.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested for: {formatDateTime(req.requestedDateTime)} ·
                          Submitted: {formatDateTime(req.submittedAt)}
                        </p>
                        {req.remarks && (
                          <p className="mt-0.5 text-xs italic text-muted-foreground">
                            "{req.remarks}"
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancel(req.id)}
                        disabled={cancelling === req.id}
                      >
                        <Ban className="mr-1 size-3.5" />
                        {cancelling === req.id ? "Cancelling..." : "Cancel"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* ── Request history ── */}
          <SectionCard
            title="Request history"
            description="Your past movement requests and their outcomes"
          >
            {pastRequests.length === 0 && pendingRequests.length === 0 ? (
              <EmptyState
                icon={ArrowLeftRight}
                title="No requests yet"
                description="Submit a movement request to get started."
              />
            ) : pastRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed requests yet.</p>
            ) : (
              <div className="space-y-3">
                {pastRequests.map((req) => {
                  const cfg = statusConfig[req.status];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={req.id}
                      className={`rounded-lg border px-4 py-3 ${cfg.border}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <Badge variant="outline" className="text-[10px]">
                            {req.type === "exit" ? "Exit" : "Entry"}
                          </Badge>
                          <span className="text-sm font-medium">{req.reason}</span>
                        </div>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        For: {formatDateTime(req.requestedDateTime)} ·
                        Submitted: {formatDateTime(req.submittedAt)}
                      </p>
                      {req.reviewedBy && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Reviewed by {req.reviewedBy} · {formatDateTime(req.reviewedAt)}
                        </p>
                      )}
                      {req.adminRemarks && (
                        <p className="mt-1 text-xs font-medium">
                          Admin remarks: {req.adminRemarks}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </>
      )}

      <NewRequestDialog
        open={showNew}
        onClose={(saved) => {
          setShowNew(false);
          if (saved) load();
        }}
      />
    </>
  );
}

/* ─── New Request Dialog ──────────────────────────────────────────────── */

function NewRequestDialog({ open, onClose }) {
  const [form, setForm] = useState({
    type: "exit",
    reason: "",
    remarks: "",
    requestedDateTime: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ type: "exit", reason: "", remarks: "", requestedDateTime: "" });
      setError("");
    }
  }, [open]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.reason.trim()) {
      setError("Please provide a reason for your request.");
      return;
    }
    if (!form.requestedDateTime) {
      setError("Please select the date and time for your movement.");
      return;
    }
    try {
      setSaving(true);
      await createMovementRequest({
        studentId: currentStudent.id,
        studentName: currentStudent.fullName,
        usn: currentStudent.usn,
        hostel: currentStudent.hostelType,
        room: currentStudent.room,
        type: form.type,
        reason: form.reason,
        remarks: form.remarks,
        requestedDateTime: new Date(form.requestedDateTime).toISOString(),
      });
      onClose(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New movement request</DialogTitle>
          <DialogDescription>
            Submit a request to exit or enter the hostel. Your warden will review and
            approve or reject it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Request type</Label>
            <Select value={form.type} onValueChange={(v) => update("type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exit">Exit request (leaving hostel)</SelectItem>
                <SelectItem value="entry">Entry request (returning to hostel)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date & time</Label>
            <Input
              type="datetime-local"
              value={form.requestedDateTime}
              onChange={(e) => update("requestedDateTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Input
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              placeholder="e.g. Weekend home visit, medical appointment..."
            />
          </div>

          <div className="space-y-2">
            <Label>
              Additional remarks{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              value={form.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              placeholder="Any additional details for the warden..."
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            <Send className="mr-1 size-3.5" />
            {saving ? "Submitting..." : "Submit request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}