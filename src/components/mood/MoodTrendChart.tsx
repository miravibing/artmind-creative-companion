import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MoodEntry {
  entry_date: string;
  mood: number;
}

interface MoodTrendChartProps {
  entries: MoodEntry[];
}

const moodLabels = ["", "Struggling", "Low", "Okay", "Good", "Amazing"];

export function MoodTrendChart({ entries }: MoodTrendChartProps) {
  const chartData = useMemo(() => {
    return [...entries]
      .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
      .map((e) => ({
        date: new Date(e.entry_date + "T12:00:00").toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        mood: e.mood,
        fullDate: new Date(e.entry_date + "T12:00:00").toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      }));
  }, [entries]);

  if (chartData.length < 2) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6">
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">Mood Trends</h3>
        <p className="text-sm text-muted-foreground">
          Log at least 2 moods to see your trend chart.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Mood Trends</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(v) => moodLabels[v]?.[0] || ""}
              tick={{ fontSize: 11 }}
              width={20}
              className="text-muted-foreground"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-popover border border-border rounded-lg p-2 shadow-md text-sm">
                    <p className="font-medium text-foreground">{d.fullDate}</p>
                    <p className="text-muted-foreground">{moodLabels[d.mood]}</p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              className="stroke-primary"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
