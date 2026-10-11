import { useCallback, useEffect, useState } from "react";
import { MessageSquareWarning, Search, Plus, Send } from "lucide-react";

import { studentGrievances, currentStudent } from "@/data/studentData";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const formatDate = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function StudentGrievancesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [activeGrievance, setActiveGrievance] = useState(null);

  const filtered = studentGrievances.filter((g) => {
    const matchesSearch =
      g.subject.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      status === "all" || g.status === status || (status === "active" && g.status !== "resolved");
    const matchesPriority = priority === "all" || g.priority === priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <>
      <PageHeader
        title="Grievances"
        description="Submit and track your complaints."
      >
        <Button onClick={() => setShowAdd(true)}>
          <Plus /> Raise a grievance
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search grievances..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="sm:w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No grievances found"
          description={search ? "Try different keywords" : "Submit a new grievance to get started."}
          action={
            <Button onClick={() => setShowAdd(true)}>
              <Plus /> Raise a grievance
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGrievance(g)}
              className="flex flex-col gap-2 text-left"
            >
              <SectionCard className="hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{g.subject}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {g.priority}
                    </Badge>
                    <StatusBadge status={g.status} />
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {g.description}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{g.category}</span>
                  <span>{formatDate(g.submittedDate)}</span>
                </div>
              </SectionCard>
            </button>
          ))}
        </div>
      )}

      <AddGrievanceDialog
        open={showAdd}
        onClose={(saved) => {
          setShowAdd(false);
          // In a real app, this would reload data
        }}
      />

      {activeGrievance && (
        <GrievanceDetail
          grievance={activeGrievance}
          onClose={() => setActiveGrievance(null)}
        />
      )}
    </>
  );
}

function AddGrievanceDialog({ open, onClose }) {
  const [form, setForm] = useState({
    category: "Infrastructure",
    subject: "",
    description: "",
    priority: "medium",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ category: "Infrastructure", subject: "", description: "", priority: "medium" });
      setError("");
    }
  }, [open]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      setError("Subject and description are required");
      return;
    }
    try {
      setSaving(true);
      // Simulated save - in a real app this would call the API
      console.log("Submitting grievance:", { ...form, studentId: currentStudent.id });
      onClose(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose(false)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle> Raise a grievance</DialogTitle>
          <DialogDescription>
            Report an issue and track its resolution status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => update("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Mess">Mess</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => update("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              placeholder="Brief summary of the issue"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the issue in detail..."
              className="min-h-24"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Submitting..." : "Submit grievance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GrievanceDetail({ grievance, onClose }) {
  return (
    <Dialog open={!!grievance} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{grievance.subject}</DialogTitle>
          <DialogDescription>
            {grievance.category} · {grievance.priority} priority
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={grievance.status} />
            <Badge variant="outline" className="capitalize">
              {grievance.priority}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(grievance.submittedDate)}
            </span>
          </div>

          <div className="rounded-lg border p-3 text-sm">
            {grievance.description}
          </div>

          {grievance.responses.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Admin responses</p>
              <div className="mt-1 space-y-2">
                {grievance.responses.map((r) => (
                  <div key={r.id} className="rounded-lg border bg-muted/50 p-2.5">
                    <p className="text-xs font-medium text-foreground">{r.respondent}</p>
                    <p className="mt-0.5 text-sm">{r.message}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDate(r.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            You will be notified when the admin responds.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}