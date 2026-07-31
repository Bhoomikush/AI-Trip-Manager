import {
    LayoutDashboard,
    Activity,
    Sparkles,
    Zap,
    Bell,
    Plus,
    Users,
    WandSparkles,
    Wallet,
} from "lucide-react";

const STATS = [
    { label: "Upcoming Trips", value: "2" },
    { label: "Expenses", value: "₹24,500" },
    { label: "Friends", value: "8" },
    { label: "Notifications", value: "4" },
];

const BENEFITS = [
    {
        icon: LayoutDashboard,
        title: "Centralized Trip Management",
        description: "Every trip, expense and plan in one workspace.",
    },
    {
        icon: Activity,
        title: "Live Activity Tracking",
        description: "See what your group is doing in real time.",
    },
    {
        icon: Sparkles,
        title: "Smart AI Insights",
        description: "AI helps you plan smarter every day.",
    },
    {
        icon: Zap,
        title: "Quick Actions",
        description: "Everything important is one click away.",
    },
];

const TODAY_PLAN = [
    "🏖 Baga Beach",
    "🏰 Fort Aguada",
    "🍽 Lunch at Thalassa",
    "🌅 Sunset Point",
];

const RECENT_ACTIVITY = [
    "Bhoomi added Hotel Booking",
    "Pawan settled ₹2,000",
    "Riya uploaded a receipt",
    "Aman joined the trip",
];

const QUICK_ACTIONS = [
    {
        title: "New Trip",
        icon: Plus,
    },
    {
        title: "Invite Friends",
        icon: Users,
    },
    {
        title: "Generate AI Plan",
        icon: WandSparkles,
    },
    {
        title: "Split Expenses",
        icon: Wallet,
    },
];

export function DashboardPreview() {
    return (
        <section className="px-6 py-24">
            <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-5 lg:items-start">

                {/* Left Side */}
                <div className="lg:col-span-2">
                    <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Everything. In one dashboard.
                    </h2>

                    <p className="mt-4 text-muted-foreground">
                        Manage trips, expenses, AI itineraries, receipts and
                        collaboration from one beautiful workspace.
                    </p>

                    <div className="mt-8 space-y-5">
                        {BENEFITS.map((benefit) => (
                            <div key={benefit.title} className="flex gap-3">
                                <benefit.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {benefit.title}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard */}
                <div className="lg:col-span-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border px-6 py-5">
                        <div>
                            <p className="text-sm font-medium">
                                👋 Welcome back, Bhoomi
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Goa Friends Trip • 3 days left
                            </p>
                        </div>

                        <div className="relative">
                            <Bell className="h-5 w-5 text-muted-foreground" />

                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                4
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 border-b border-border px-6 py-5 sm:grid-cols-4">
                        {STATS.map((stat) => (
                            <div key={stat.label}>
                                <p className="text-xl font-semibold">
                                    {stat.value}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Main Grid */}
                    <div className="grid gap-5 p-6 lg:grid-cols-3">

                        {/* AI Itinerary */}
                        <div className="rounded-xl border border-border bg-muted/20 p-5 lg:col-span-2">

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">
                                        Today's AI Itinerary
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Generated for Goa Friends Trip
                                    </p>
                                </div>

                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                    AI Generated
                                </span>
                            </div>

                            <div className="mt-5 space-y-3">
                                {TODAY_PLAN.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 transition hover:shadow-sm"
                                    >
                                        <span>{item}</span>

                                        <span className="text-xs text-muted-foreground">
                                            Scheduled
                                        </span>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Expense Summary */}
                        <div className="rounded-xl border border-border p-5">

                            <p className="font-semibold">
                                Expense Summary
                            </p>

                            <div className="mt-5 space-y-5">

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total
                                    </p>

                                    <p className="text-2xl font-semibold">
                                        ₹24,500
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Settled
                                    </p>

                                    <p className="font-medium text-green-600">
                                        ₹18,000
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Pending
                                    </p>

                                    <p className="font-medium text-orange-500">
                                        ₹6,500
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* Bottom Grid */}
                    <div className="grid gap-5 border-t border-border p-6 lg:grid-cols-3">

                        {/* Activity */}
                        <div className="rounded-xl border border-border p-5 lg:col-span-2">

                            <p className="font-semibold">
                                Recent Activity
                            </p>

                            <div className="mt-5 space-y-4">
                                {RECENT_ACTIVITY.map((activity) => (
                                    <div
                                        key={activity}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="h-2 w-2 rounded-full bg-primary"></span>

                                        <p className="text-sm">
                                            {activity}
                                        </p>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Quick Actions */}
                        <div className="rounded-xl border border-border p-5">

                            <p className="font-semibold">
                                Quick Actions
                            </p>

                            <div className="mt-5 grid gap-3">

                                {QUICK_ACTIONS.map((action) => (
                                    <button
                                        key={action.title}
                                        className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-left text-sm transition hover:bg-muted"
                                    >
                                        <action.icon className="h-4 w-4 text-primary" />

                                        {action.title}
                                    </button>
                                ))}

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}