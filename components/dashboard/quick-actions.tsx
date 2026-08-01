import {
    Plus,
    Users,
    Sparkles,
    Wallet,
} from "lucide-react";

const ACTIONS = [
    {
        title: "Create Trip",
        icon: Plus,
    },
    {
        title: "Invite Friends",
        icon: Users,
    },
    {
        title: "AI Planner",
        icon: Sparkles,
    },
    {
        title: "Add Expense",
        icon: Wallet,
    },
];

export function QuickActions() {
    return (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">
                Quick Actions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
                Jump into your most common tasks.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {ACTIONS.map((action) => (
                    <button
                        key={action.title}
                        className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition hover:border-primary/40 hover:bg-muted/40"
                    >
                        <div className="rounded-lg bg-primary/10 p-3">
                            <action.icon className="h-5 w-5 text-primary" />
                        </div>

                        <span className="font-medium text-foreground">
                            {action.title}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}