import { AlertTriangle, Lightbulb, CalendarClock, TrendingUp } from "lucide-react";

type Severity = "warning" | "tip" | "reminder" | "positive";

const SEVERITY_STYLES: Record<Severity, string> = {
    warning: "bg-amber-100 text-amber-700",
    reminder: "bg-blue-100 text-blue-700",
    tip: "bg-primary/10 text-primary",
    positive: "bg-green-100 text-green-700",
};
const INSIGHTS: { icon: typeof AlertTriangle; message: string; severity: Severity }[] = [
    {
        icon: AlertTriangle,
        message: "You've used 80% of your Goa Friends Trip budget.",
        severity: "warning",
    },
    {
        icon: CalendarClock,
        message: "Goa Friends Trip starts in 3 days — itinerary isn't finalized.",
        severity: "reminder",
    },
    {
        icon: Lightbulb,
        message: "Manali Adventure has no saved locations yet. Add a few to speed up planning.",
        severity: "tip",
    },
    {
        icon: TrendingUp,
        message: "You're spending 15% less than your last group trip. Nice work.",
        severity: "positive",
    },
];


export function AIInsights() {
    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                    AI Insights
                </h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                    Powered by AI
                </span>
            </div>

            <div className="mt-4 space-y-3">
                {INSIGHTS.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${SEVERITY_STYLES[insight.severity]}`}
                        >
                            <insight.icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm text-foreground">{insight.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}