import { Receipt, Calculator, Zap, HandCoins } from "lucide-react";


const BALANCES = [
    { from: "Pawan", to: "Bhoomi", amount: 750 },
    { from: "Riya", to: "Bhoomi", amount: 1500 },
];


const MEMBER_PAYMENTS = [
    { name: "Bhoomi", paid: 10000 },
    { name: "Pawan", paid: 8500 },
    { name: "Riya", paid: 6000 },
];

function formatINR(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

const BENEFITS = [
    {
        icon: Receipt,
        title: "Shared Expense Tracking",
        description: "Every expense logged is visible to the whole group.",
    },
    {
        icon: Calculator,
        title: "Automatic Balance Calculation",
        description: "Tripzy does the math — no manual splitting required.",
    },
    {
        icon: Zap,
        title: "Real-Time Updates",
        description: "Balances update instantly as new expenses come in.",
    },
    {
        icon: HandCoins,
        title: "One-Tap Settlement",
        description: "Settle up with the fewest possible payments.",
    },
];

export function ExpensePreview() {
    return (
        <section className="px-6 py-24">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                    <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Split expenses. Not friendships.
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Track every shared expense automatically. Know who paid, who
                        owes, and settle balances without awkward conversations.
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
                    {/* Header — trip name is small, total expense is the hero number */}
                    <div className="border-b border-border px-5 py-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Goa Friends Trip
                        </p>
                        <div className="mt-1 flex items-baseline gap-2">
                            <p className="text-2xl font-semibold text-foreground">
                                {formatINR(24500)}
                            </p>
                            <span className="text-xs text-muted-foreground">
                                total expenses
                            </span>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="border-b border-border px-5 py-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Members
                        </p>
                        <div className="mt-3 space-y-3">
                            {MEMBER_PAYMENTS.map((member) => (
                                <div
                                    key={member.name}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                            {member.name.charAt(0)}
                                        </div>
                                        <span className="text-sm text-foreground">
                                            {member.name}
                                        </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Paid {formatINR(member.paid)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Balance Summary */}
                    <div className="border-b border-border px-5 py-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">
                                Balance Summary
                            </p>
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                Auto Calculated
                            </span>
                        </div>
                        <div className="mt-3 space-y-2">
                            {BALANCES.map((balance, i) => (
                                <p key={i} className="text-sm text-foreground">
                                    <span className="font-medium">{balance.from}</span>{" "}
                                    <span className="text-muted-foreground">owes</span>{" "}
                                    <span className="font-medium">{balance.to}</span>{" "}
                                    <span className="font-semibold text-primary">
                                        {formatINR(balance.amount)}
                                    </span>
                                </p>
                            ))}
                        </div>
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="text-green-600">✓</span>
                            Settlements calculated
                        </p>
                    </div>

                    {/* Recent Expense */}
                    <div className="px-5 py-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Recent Expense
                        </p>
                        <div className="mt-2.5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Dinner at Thalassa
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Added 5 mins ago
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                    {formatINR(4200)}
                                </span>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    Shared
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}