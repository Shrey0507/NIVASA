import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BedDouble,
  MessageSquareWarning,
  UtensilsCrossed,
  Users,
  LogIn,
  LogOut as LogOutIcon,
  HelpCircle,
  ClipboardList,
} from "lucide-react";

import {
  dashboardStats,
  occupancyData,
  pendingActions,
} from "@/data/adminMockData";
import {
  PRESENCE_DATA_NOTE,
  demoAssignedStudents,
  demoPresenceEvents,
  getRecentPresenceEvents,
  presenceEventLabel,
} from "@/data/presenceData";
import {
  PRESENCE_RULE,
  calculatePresence,
  estimateMeals,
  getUpcomingMeal,
} from "@/lib/presence";
import { useAuth, ADMIN_ROLES } from "@/hooks/useAuth";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Computed once at module load — the register does not change during a render,
// so there is no reason to recalculate it on every mount.
const presence = calculatePresence(demoAssignedStudents, demoPresenceEvents);
const recentPresenceEvents = getRecentPresenceEvents(demoPresenceEvents, 6);

const BUFFER_OPTIONS = [0, 5, 10, 15];

const timeAgo = (iso) => {
  if (!iso) return "no data";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const formatClock = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/* ─── Hostel Tab Switcher ──────────────────────────────────────────────── */

function HostelTabs({ activeHostel, onSwitch, locked }) {
  const tabs = [
    { key: "all", label: "All Hostels" },
    { key: "boys", label: "Boys' Hostel" },
    { key: "girls", label: "Girls' Hostel" },
  ];

  // Hostel-specific admins only see their tab (locked)
  const visibleTabs = locked ? tabs.filter((t) => t.key === activeHostel) : tabs;

  return (
    <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
      {visibleTabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onSwitch(tab.key)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeHostel === tab.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Presence Card (primary dashboard metric) ─────────────────────────── */

function PresenceCard({ hostelFilter }) {
  const data = useMemo(() => {
    if (!hostelFilter || hostelFilter === "all") return presence;
    // Filter to single hostel
    const bucket = presence.byHostel[hostelFilter] ?? { inside: 0, assigned: 0, outside: 0, unknown: 0 };
    return {
      ...bucket,
      lastUpdatedAt: presence.lastUpdatedAt,
    };
  }, [hostelFilter]);

  const insidePct = data.assigned
    ? Math.round((data.inside / data.assigned) * 100)
    : 0;

  const hostelLabel =
    hostelFilter === "boys"
      ? "Boys' Hostel"
      : hostelFilter === "girls"
        ? "Girls' Hostel"
        : "All Hostels";

  return (
    <SectionCard
      title={`Students currently inside — ${hostelLabel}`}
      description="Based on each resident's latest valid entry/exit event."
      className="lg:col-span-2"
      action={<Badge variant="secondary">Demo data</Badge>}
    >
      {/* ── Hero count ── */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div className="flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success sm:size-16">
            <Users className="size-7 sm:size-8" />
          </span>
          <div>
            <p className="text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">
              {data.inside}
            </p>
            <p className="text-sm text-muted-foreground">
              of {data.assigned} residents
            </p>
          </div>
        </div>
      </div>

      <Progress value={insidePct} className="mt-5 h-2.5" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{insidePct}% present</span>
        <span>
          Last register entry {timeAgo(data.lastUpdatedAt)}
          {data.lastUpdatedAt ? ` · ${formatClock(data.lastUpdatedAt)}` : ""}
        </span>
      </div>

      {/* ── Breakdown chips ── */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <BreakdownChip
          label="Inside"
          icon={LogIn}
          value={data.inside}
          total={data.assigned}
          tone="text-success"
        />
        <BreakdownChip
          label="Outside"
          icon={LogOutIcon}
          value={data.outside}
          total={data.assigned}
          tone="text-warning"
        />
        <BreakdownChip
          label="Unknown"
          icon={HelpCircle}
          value={data.unknown}
          total={data.assigned}
        />
      </div>

      {/* ── Per-hostel split (only when viewing all) ── */}
      {(!hostelFilter || hostelFilter === "all") && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {["boys", "girls"].map((key) => {
            const bucket = presence.byHostel[key] ?? { inside: 0, assigned: 0 };
            const label = key === "boys" ? "Boys' Hostel" : "Girls' Hostel";
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2.5"
              >
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm tabular-nums">
                  <span className="font-semibold text-success">{bucket.inside}</span>
                  <span className="text-muted-foreground"> / {bucket.assigned} inside</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {PRESENCE_RULE} {PRESENCE_DATA_NOTE}
      </p>
    </SectionCard>
  );
}

function BreakdownChip({ label, icon: Icon, value, total, tone }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <Icon className={`size-3.5 ${tone ?? "text-muted-foreground"}`} />
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${tone ?? ""}`}>{value}</p>
      <p className="text-xs tabular-nums text-muted-foreground">{pct}%</p>
    </div>
  );
}

/* ─── Mess Planning Card ───────────────────────────────────────────────── */

function MessPlanningCard() {
  const [buffer, setBuffer] = useState(5);
  const meal = useMemo(() => getUpcomingMeal(), []);
  const estimate = useMemo(
    () => estimateMeals(presence.inside, buffer),
    [buffer],
  );

  return (
    <SectionCard
      title="Mess planning"
      description="Portions to prepare for the next meal."
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/mess">
            Mess <ArrowRight />
          </Link>
        </Button>
      }
    >
      <div className="flex items-center gap-3 rounded-lg border bg-primary/5 p-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UtensilsCrossed className="size-4.5" />
        </span>
        <div>
          <p className="text-sm font-semibold">
            {meal.label}
            {meal.tomorrow ? " (tomorrow)" : ""}
          </p>
          <p className="text-xs text-muted-foreground">{meal.window}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-4xl font-semibold tracking-tight tabular-nums">
          {estimate.estimated}
        </p>
        <p className="text-xs text-muted-foreground">
          estimated portions to prepare
        </p>
      </div>

      <div className="mt-4 space-y-1.5">
        <label
          htmlFor="meal-buffer"
          className="text-xs font-medium text-muted-foreground"
        >
          Safety buffer
        </label>
        <Select
          value={String(buffer)}
          onValueChange={(value) => setBuffer(Number(value))}
        >
          <SelectTrigger id="meal-buffer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUFFER_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option === 0 ? "No buffer" : `+${option}% extra`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Inside now</dt>
          <dd className="font-medium tabular-nums">{estimate.insideCount}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Buffer</dt>
          <dd className="font-medium tabular-nums">
            +{estimate.bufferPercent}% ({estimate.buffer})
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {estimate.assumption}
      </p>
    </SectionCard>
  );
}

/* ─── Occupancy Bars ───────────────────────────────────────────────────── */

function OccupancyBars({ hostelFilter }) {
  const hostelKey = hostelFilter === "girls" ? "girls" : "boys";
  const data = occupancyData[hostelKey] ?? occupancyData.boys;
  const totals = Object.values(data).reduce(
    (acc, blocks) => {
      Object.values(blocks).forEach((b) => {
        acc.occupied += b.occupied;
        acc.total += b.total;
      });
      return acc;
    },
    { occupied: 0, total: 0 },
  );

  const hostelLabel = hostelKey === "boys" ? "Boys' Hostel" : "Girls' Hostel";

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold tabular-nums">
            {totals.occupied}
            <span className="text-base font-normal text-muted-foreground">
              /{totals.total} beds
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{hostelLabel} occupancy</p>
        </div>
        <Badge variant="success">
          {Math.round((totals.occupied / totals.total) * 100)}%
        </Badge>
      </div>

      <div className="space-y-3.5">
        {Object.entries(data).map(([floor, blocks]) => {
          const occ = Object.values(blocks).reduce((s, b) => s + b.occupied, 0);
          const tot = Object.values(blocks).reduce((s, b) => s + b.total, 0);
          const pct = Math.round((occ / tot) * 100);
          return (
            <div key={floor} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Floor {floor}</span>
                <span className="text-muted-foreground tabular-nums">
                  {occ}/{tot} · {pct}%
                </span>
              </div>
              <Progress value={pct} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Recent Movement Feed ─────────────────────────────────────────────── */

function RecentMovementFeed() {
  return (
    <ol className="space-y-4">
      {recentPresenceEvents.map((event) => {
        const who = presenceEventLabel(event.studentId);
        const isEntry = event.type === "entry";
        return (
          <li key={event.id} className="flex items-center gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="text-[11px]">
                {who.name.replace(/[^A-Za-z]/g, "").charAt(0) || "R"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{who.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {who.usn ?? "Demo resident"} · {who.room ?? "—"}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={isEntry ? "success" : "warning"}>
                {isEntry ? "Entry" : "Exit"}
              </Badge>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {timeAgo(event.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ─── Dashboard Page ───────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { role, hostel: adminHostel } = useAuth();
  const stats = dashboardStats;

  // Determine the active hostel tab based on admin role
  const isLocked = role === "boys" || role === "girls";
  const defaultTab = isLocked ? adminHostel : "all";
  const [activeHostel, setActiveHostel] = useState(defaultTab);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Who is inside the hostel right now, plus today's operations."
      >
        <HostelTabs
          activeHostel={activeHostel}
          onSwitch={setActiveHostel}
          locked={isLocked}
        />
      </PageHeader>

      {/* ── Primary: presence + mess planning ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <PresenceCard hostelFilter={activeHostel} />
        <MessPlanningCard />
      </div>

      {/* ── Secondary stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Room occupancy"
          value={`${stats.roomOccupancy.percentage}%`}
          hint={`${stats.roomOccupancy.total - stats.roomOccupancy.occupied} beds free`}
          icon={BedDouble}
        />
        <StatCard
          label="Open grievances"
          value={stats.openGrievances}
          hint="need attention"
          icon={MessageSquareWarning}
          accent="bg-destructive/10 text-destructive"
        />
        <StatCard
          label="Pending requests"
          value="3"
          hint="movement requests awaiting review"
          icon={ClipboardList}
          accent="bg-warning/10 text-warning"
        />
      </div>

      {/* ── Occupancy + recent activity ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Room occupancy" description="Beds filled per floor">
          <OccupancyBars hostelFilter={activeHostel} />
        </SectionCard>

        <SectionCard
          title="Recent entry / exit activity"
          description="Latest gate register events"
          action={<Badge variant="secondary">Demo data</Badge>}
        >
          <RecentMovementFeed />
        </SectionCard>
      </div>

      {/* ── Needs attention ── */}
      <SectionCard
        title="Needs attention"
        description="Items that require admin action"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Open grievances
            </p>
            <ul className="space-y-2">
              {pendingActions.openGrievances.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{g.student}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {g.issue}
                    </p>
                  </div>
                  <Badge variant="warning">{g.days}d</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pending returns
            </p>
            <ul className="space-y-2">
              {pendingActions.pendingReturns.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
                >
                  <span className="truncate text-sm font-medium">
                    {p.student}
                  </span>
                  <StatusBadge status="out" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Overdue fees
            </p>
            <ul className="space-y-2">
              {pendingActions.overdueFees.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px]">
                        {f.student.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{f.student}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {f.usn}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    ₹{f.amount.toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
