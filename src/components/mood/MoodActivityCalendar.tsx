import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoodEntry {
  entry_date: string;
  mood: number;
  note: string | null;
}

interface MoodActivityCalendarProps {
  entries: MoodEntry[];
}

const moodEmojis = ["😢", "😔", "😐", "😊", "😄"];
const moodIntensity = [
  "bg-destructive/30",
  "bg-warning/30",
  "bg-muted-foreground/20",
  "bg-success/30",
  "bg-primary/40",
];

export function MoodActivityCalendar({ entries }: MoodActivityCalendarProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const totalDays = 91; // ~13 weeks
    const start = new Date(today);
    start.setDate(start.getDate() - totalDays + 1);

    // Align to Sunday
    const startDay = start.getDay();
    start.setDate(start.getDate() - startDay);

    const entryMap = new Map<string, MoodEntry>();
    entries.forEach((e) => entryMap.set(e.entry_date, e));

    const weeks: { date: Date; entry?: MoodEntry }[][] = [];
    const current = new Date(start);
    const monthLabelsSet: { label: string; col: number }[] = [];
    let lastMonth = -1;

    while (current <= today || weeks.length < 13) {
      const week: { date: Date; entry?: MoodEntry }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split("T")[0];
        week.push({
          date: new Date(current),
          entry: entryMap.get(dateStr),
        });
        if (current.getMonth() !== lastMonth) {
          lastMonth = current.getMonth();
          monthLabelsSet.push({
            label: current.toLocaleDateString("en-US", { month: "short" }),
            col: weeks.length,
          });
        }
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
      if (weeks.length >= 14) break;
    }

    return { weeks, monthLabels: monthLabelsSet };
  }, [entries]);

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Mood Activity
      </h3>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((l, i) => (
            <div key={i} className="h-3 w-6 text-[10px] text-muted-foreground leading-3">
              {l}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-x-auto">
          {/* Month labels */}
          <div className="flex gap-1 mb-1" style={{ minWidth: weeks.length * 16 }}>
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="text-[10px] text-muted-foreground absolute"
                style={{ left: m.col * 16 }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-1 mt-4">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => {
                  const isToday =
                    day.date.toISOString().split("T")[0] ===
                    new Date().toISOString().split("T")[0];
                  const isFuture = day.date > new Date();

                  return (
                    <Tooltip key={di}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "w-3 h-3 rounded-sm transition-all",
                            isFuture
                              ? "bg-transparent"
                              : day.entry
                              ? moodIntensity[day.entry.mood - 1]
                              : "bg-muted/40",
                            isToday && "ring-1 ring-primary"
                          )}
                        />
                      </TooltipTrigger>
                      {!isFuture && (
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">
                            {day.date.toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          {day.entry ? (
                            <p>
                              {moodEmojis[day.entry.mood - 1]}{" "}
                              {day.entry.note || "No note"}
                            </p>
                          ) : (
                            <p className="text-muted-foreground">No entry</p>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        {moodIntensity.map((c, i) => (
          <div key={i} className={cn("w-3 h-3 rounded-sm", c)} title={moodEmojis[i]} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
