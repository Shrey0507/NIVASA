import { currentStudent } from "@/data/studentData";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="font-medium text-sm">{value || "—"}</span>
  </div>
);

export default function StudentProfilePage() {
  const s = currentStudent;

  // Room chips without bed number
  const roomChips = [
    { label: "Building", value: s.building },
    { label: "Floor", value: `Floor ${s.floor}` },
    { label: "Block", value: `Block ${s.block}` },
    { label: "Room", value: s.room },
  ];

  return (
    <>
      <PageHeader
        title="My profile"
        description="Your personal and hostel details (read-only)."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-1">
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar className="size-24">
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {s.fullName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{s.fullName}</h3>
              <p className="font-mono text-sm text-muted-foreground">{s.usn}</p>
            </div>
            <Badge variant={s.status === "active" ? "success" : "secondary"}>
              {s.status}
            </Badge>
            <Separator />
            <div className="w-full space-y-1 text-left">
              <DetailRow label="Department" value={s.department} />
              <DetailRow label="Year" value={s.class} />
              <DetailRow label="Semester" value={s.semester} />
              <DetailRow label="Hostel type" value={s.hostelType === "boys" ? "Boys' Hostel" : "Girls' Hostel"} />
              <DetailRow label="Joining date" value={formatDate(s.joiningDate)} />
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Contact information">
            <p className="mb-3 text-xs text-muted-foreground">
              Contact details are managed by the hostel office. To update, please visit the warden.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Personal email
                </p>
                <p className="text-sm">{s.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Phone
                </p>
                <p className="text-sm">{s.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Guardian name
                </p>
                <p className="text-sm">{s.guardianName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Guardian phone
                </p>
                <p className="text-sm">{s.guardianPhone}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Hostel details">
            <div className="flex flex-wrap gap-2">
              {roomChips.map((chip) => (
                <div
                  key={chip.label}
                  className="rounded-lg border bg-muted/50 px-4 py-2"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {chip.label}
                  </p>
                  <p className="text-sm font-semibold">{chip.value}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Warden
                </p>
                <p className="text-sm">{s.warden}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Warden contact
                </p>
                <p className="text-sm">{s.wardenPhone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Joining date
                </p>
                <p className="text-sm">{formatDate(s.joiningDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-sm capitalize">{s.status}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}