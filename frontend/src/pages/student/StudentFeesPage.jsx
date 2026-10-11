import { Link } from "react-router-dom";
import { ArrowRight, IndianRupee } from "lucide-react";

import {
  studentFeeRecords,
  studentFeeSummary,
} from "@/data/studentData";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function StudentFeesPage() {
  const { totalBilled, totalPaid, outstanding, nextDueDate } = studentFeeSummary;
  const pct = totalBilled ? Math.round((totalPaid / totalBilled) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Fees"
        description="Your fee records and payment status."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Payment overview</h3>
            <span className="text-sm text-muted-foreground">All time</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Paid</span>
                <span className="font-medium tabular-nums">
                  {inr(totalPaid)} / {inr(totalBilled)}
                </span>
              </div>
              <Progress value={pct} className="mt-2 h-2" />
            </div>
            <Separator />
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span className="text-sm text-muted-foreground">
                Outstanding balance
              </span>
              <span className="text-xl font-semibold tabular-nums text-destructive">
                {inr(outstanding)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next due date</span>
              <span className="font-medium">{formatDate(nextDueDate)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Information">
          <div className="space-y-3">
            <Button className="w-full" variant="outline">
              Download fee receipt
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Fee payments are collected offline at the hostel office.
              Contact the warden for payment queries.
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Fee history">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Term</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentFeeRecords.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.category}</TableCell>
                <TableCell>{r.term}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {inr(r.amount)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-success">
                  {inr(r.paid)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {inr(r.balance)}
                </TableCell>
                <TableCell>{formatDate(r.dueDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </>
  );
}