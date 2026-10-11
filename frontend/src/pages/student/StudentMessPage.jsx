import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studentMessMenu } from "@/data/studentData";

const MEALS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
  { key: "dinner", label: "Dinner" },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export default function StudentMessPage() {
  return (
    <>
      <PageHeader
        title="Mess menu"
        description="Today's and upcoming meals in the hostel mess."
      />

      <Tabs defaultValue={studentMessMenu[0]?.date}>
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          {studentMessMenu.map((day) => (
            <TabsTrigger key={day.id} value={day.date} className="min-w-[120px]">
              {day.day}
              <span className="ml-1 text-xs text-muted-foreground">
                {new Date(day.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {studentMessMenu.map((day) => (
          <TabsContent key={day.id} value={day.date}>
            <SectionCard
              title={day.day}
              description={formatDate(day.date)}
              className="animate-in fade-in-50"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {MEALS.map((meal) => {
                  const section = day[meal.key];
                  if (!section) return null;
                  return (
                    <div
                      key={meal.key}
                      className="rounded-lg border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{meal.label}</p>
                        <span className="text-xs text-muted-foreground">
                          {section.time}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {section.items.join(" · ")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}