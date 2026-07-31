import { UserPlus, Zap, Map, Receipt } from "lucide-react";


const ACTIVITY = [
    { name: "Bhoomi", action: "added Hotel Booking" },
    { name: "Pawan", action: "updated Day 2 itinerary" },
    { name: "Riya", action: "added Baga Beach" },
    { name: "Aman", action: "uploaded a receipt" },
];

const CHECKLIST = [
    { label: "Hotel Booked", done: true },
    { label: "Flights Confirmed", done: true },
    { label: "Book Scooter", done: false },
    { label: "Reserve Dinner", done: false },
];

const MEMBERS = [
    { name: "Bhoomi", status: "online" as const },
    { name: "Pawan", status: "online" as const },
    { name: "Riya", status: "editing" as const },
    { name: "Aman", status: "offline" as const },
];

const STATUS_STYLES: Record<string, string> = {
    online: "bg-green-500",
    editing: "bg-amber-500",
    offline: "bg-muted-foreground/40",
};

const STATUS_LABELS: Record<string, string> = {
    online: "Online",
    editing: "Editing",
    offline: "Offline",
};

const BENEFITS = [
    {
        icon: UserPlus,
        title: "Invite Friends",
        description: "Add everyone to the trip with a single shared link.",
    },
    {
        icon: Zap,
        title: "Real-Time Updates",
        description: "See changes the moment someone else makes them.",
    },
    {
        icon: Map,
        title: "Shared Itinerary",
        description: "One itinerary everyone can view and edit together.",
    },
    {
        icon: Receipt,
        title: "Shared Expense Tracking",
        description: "Every expense is visible to the whole group, instantly.",
    },
];

export function Collaboration() {
    return (
        <section className="px-6 py-24">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                    <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Plan together. Stay in sync.
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Invite your friends and manage every part of the trip in one
                        shared workspace. No more endless chats, spreadsheets, or
                        confusion.
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

                <div className="rounded-xl border border-border bg-card shadow-sm">
                    {/* Top bar */}
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Goa Friends Trip
                            </p>
                            <p className="text-xs text-muted-foreground">4 members</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {MEMBERS.map((member) => (
                                    <div
                                        key={member.name}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-xs font-medium text-primary"
                                    >
                                        {member.name.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <button className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                                Invite
                            </button>
                        </div>
                    </div>

                    {/* Trip Members */}
                    <div className="border-b border-border px-5 py-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Trip Members
                        </p>
                        <div className="mt-3 space-y-2.5">
                            {MEMBERS.map((member) => (
                                <div key={member.name} className="flex items-center gap-2.5">
                                    <span
                                        className={`h-2 w-2 rounded-full ${STATUS_STYLES[member.status]}`}
                                    />
                                    <span className="text-sm text-foreground">
                                        {member.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {STATUS_LABELS[member.status]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Recent Activity */}
                    <div className="border-b border-border px-5 py-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">
                                Recent Activity
                            </p>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Updated 2 min ago
                            </span>
                        </div>
                        <div className="mt-3 space-y-2">
                            {ACTIVITY.map((entry, i) => (
                                <p key={i} className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {entry.name}
                                    </span>{" "}
                                    {entry.action}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Shared Checklist */}
                    <div className="border-b border-border px-5 py-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Shared Checklist
                        </p>
                        <div className="mt-3 space-y-2">
                            {CHECKLIST.map((item) => (
                                <div key={item.label} className="flex items-center gap-2.5">
                                    <div
                                        className={`flex h-4 w-4 items-center justify-center rounded border ${item.done
                                            ? "border-primary bg-primary"
                                            : "border-border"
                                            }`}
                                    >
                                        {item.done && (
                                            <span className="text-[10px] leading-none text-primary-foreground">
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm ${item.done
                                            ? "text-muted-foreground line-through"
                                            : "text-foreground"
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live status */}
                    <div className="flex items-center gap-2 px-5 py-4">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                            Everyone stays synced instantly
                        </span>
                        <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            LIVE
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}