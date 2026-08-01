import {
    Plane,
    Wallet,
    Users,
    Sparkles,
} from "lucide-react";

const OVERVIEW = [
    {
        title: "Upcoming Trips",
        value: "2",
        description: "1 starts this week",
        icon: Plane,
    },
    {
        title: "Total Expenses",
        value: "₹24,500",
        description: "Across all trips",
        icon: Wallet,
    },
    {
        title: "Friends",
        value: "8",
        description: "Travel companions",
        icon: Users,
    },
    {
        title: "AI Plans",
        value: "5",
        description: "Generated itineraries",
        icon: Sparkles,
    },
];

export function OverviewCards() {
    return (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {OVERVIEW.map((item) => (
                <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {item.title}
                            </p>

                            <h3 className="mt-2 text-3xl font-bold text-foreground">
                                {item.value}
                            </h3>
                        </div>

                        <div className="rounded-lg bg-primary/10 p-3">
                            <item.icon className="h-6 w-6 text-primary" />
                        </div>
                    </div>

                    <p className="mt-5 text-sm text-muted-foreground">
                        {item.description}
                    </p>
                </div>
            ))}
        </section>
    );
}