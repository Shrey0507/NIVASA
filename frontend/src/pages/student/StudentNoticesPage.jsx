import { useCallback, useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";

import { studentNotices } from "@/data/studentData";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const AudienceBadge = ({ audience }) => {
  if (audience === "all") return null;
  return (
    <Badge variant="outline" className="capitalize">
      {audience}
    </Badge>
  );
};

export default function StudentNoticesPage() {
  const [search, setSearch] = useState("");
  const filtered = studentNotices.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Notices"
        description="Announcements from the hostel office."
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search notices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices found"
          description="Try a different search term."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((n) => (
            <SectionCard key={n.id} className="transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <p className="font-semibold">{n.title}</p>
                <StatusBadge status={n.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{n.body}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <AudienceBadge audience={n.audience} />
                  <span>{n.author}</span>
                </div>
                <span>{formatDate(n.publishDate)}</span>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </>
  );
}