import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  MessageSquareWarning,
  UtensilsCrossed,
} from "lucide-react";

import {
  currentStudent,
  studentFeeSummary,
  studentGrievances,
  studentMessMenu,
  studentMovements,
  studentNotices,
} from "@/data/studentData";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculatePresence } from "@/lib/presence";

const inr = (n) => `₹${n.toLocaleString("en-IN")}`;

const MEAL_ORDER = ["breakfast", "lunch", "snacks", "dinner"];
const MEAL_LABEL = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Snacks",
  dinner: "Dinner",
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function StudentDashboardPage() {
  const student = currentStudent;
  const today = studentMessMenu[0];
  const openGrievances = studentGrievances.filter(
    (g) => g.status !== "resolved",
  );
  const latestNotices = studentNotices.slice(0, 3);
  const pendingFees = studentFeeSummary.outstanding > 0;

  // Reuse the shared rule: the resident's own status comes from the latest
  // valid entry/exit event, not from room or fee data.
  const myPresence = useMemo(() => {
    const events = studentMovements.flatMap((m) => {
      const list = [
        { studentId: student.id, type: "exit", timestamp: m.departureTime },
      ];
      if (m.actualReturn) {
        list.push({
          studentId: student.id,
          type: "entry",
          timestamp: m.actualReturn,
        });
      }
      return list;
    });
    return calculatePresence(
      [
        {
          id: student.id,
          fullName: student.fullName,
          usn: student.usn,
          hostel: student.hostelType,
        },
      ],
      events,
    ).students[0];
  }, [student]);

  const presenceMeta = {
    inside: { label: "Inside hostel", variant: "success" },
    outside: { label: "Outside hostel", variant: "warning" },
    unknown: { label: "Status unknown", variant: "secondary" },
  }[myPresence.status];

  const roomChips = [
    { label: "Building", value: student.building },
    { label: "Floor", value: `Floor ${student.floor}` },
    { label: "Block", value: `Block ${student.block}` },
    { label: "Room", value: student.room },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${student.fullName.split(" ")[0]}`}
        description="Here's everything about your stay today."
      />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border bg-sidebar p-6 sm:p-7">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-primary">{student.usn}</p>
              <Badge variant={presenceMeta.variant}>{presenceMeta.label}</Badge>
            </div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {student.department} · {student.class}
            </h2>
            <p className="text-sm text-muted-foreground">
              You are assigned to{" "}
              <span className="font-medium text-foreground">
                {student.room}
              </span>
              . {myPresence.lastEventAt
                ? `Your last gate record was ${formatDateTime(myPresence.lastEventAt)}.`
                : "No gate record found yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {roomChips.map((chip) => (
              <div
                key={chip.label}
                className="rounded-lg border bg-card/80 px-3 py-2 backdrop-blur"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {chip.label}
                </p>
                <p className="text-sm font-semibold">{chip.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding dues"
          value={inr(studentFeeSummary.outstanding)}
          hint={pendingFees ? "payment pending" : "all cleared"}
          icon={CreditCard}
          accent={
            pendingFees
              ? "bg-warning/10 text-warning"
              : "bg-success/10 text-success"
          }
        />
        <StatCard
          label="Next due date"
          value={formatDate(studentFeeSummary.nextDueDate)}
          hint="mess fee"
          icon={CalendarClock}
        />
        <StatCard
          label="Open grievances"
          value={openGrievances.length}
          hint="in progress or open"
          icon={MessageSquareWarning}
        />
        <StatCard
          label="Notices"
          value={latestNotices.length}
          hint="recent updates"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's mess */}
        <SectionCard
          title="Today's mess menu"
          description={formatDate(today.date)}
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/mess">
                Full menu <ArrowRight />
              </Link>
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {MEAL_ORDER.map((meal) => {
              const section = today[meal];
              return (
                <div
                  key={meal}
                  className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <UtensilsCrossed className="size-3.5" />
                      </span>
                      <p className="text-sm font-semibold">
                        {MEAL_LABEL[meal]}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {section.time}
                    </span>
                  </div>
                  <p className="mt-2.5 text-sm text-muted-foreground">
                    {section.items.join(" · ")}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Fee status */}
        <SectionCard
          title="Fee status"
          description="Your current balance"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/fees">
                Details <ArrowRight />
              </Link>
            </Button>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {inr(studentFeeSummary.outstanding)}
              </p>
              <p className="text-xs text-muted-foreground">outstanding</p>
            </div>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total billed</span>
                <span className="font-medium tabular-nums">
                  {inr(studentFeeSummary.totalBilled)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total paid</span>
                <span className="font-medium tabular-nums text-success">
                  {inr(studentFeeSummary.totalPaid)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next due</span>
                <span className="font-medium">
                  {formatDate(studentFeeSummary.nextDueDate)}
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/student/fees">View fee records</Link>
            </Button>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grievances */}
        <SectionCard
          title="My grievances"
          description="Complaint status at a glance"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/grievances">
                Manage <ArrowRight />
              </Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {studentGrievances.slice(0, 3).map((g) => (
              <li
                key={g.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-card px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{g.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.category} · {formatDate(g.submittedDate)}
                  </p>
                </div>
                <StatusBadge status={g.status} className="shrink-0" />
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Movements */}
        <SectionCard
          title="In / Out register"
          description="Your recent movements"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/movements">
                View all <ArrowRight />
              </Link>
            </Button>
          }
        >
          <ul className="space-y-3">
            {studentMovements.slice(0, 3).map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    Out {formatDateTime(m.departureTime)}
                  </p>
                </div>
                <StatusBadge status={m.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Notices */}
      <SectionCard
        title="Latest notices"
        description="Announcements from the hostel office"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/notices">
              All notices <ArrowRight />
            </Link>
          </Button>
        }
      >
        <ul className="divide-y">
          {latestNotices.map((n) => (
            <li key={n.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  <Badge variant="outline" className="capitalize">
                    {n.audience === "all" ? "All" : n.audience}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {n.body}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.author} · {formatDate(n.publishDate)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
