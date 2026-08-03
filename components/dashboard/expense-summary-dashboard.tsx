"use client";

import { Wallet, Users, Receipt, Coins } from "lucide-react";

interface SummaryData {
    totalExpenses: number;
    totalMembers: number;
    totalEntries: number;
    averagePerMember: number;
}

interface CategoryTotal {
    category: string;
    totalAmount: number;
}

interface ExpenseSummaryDashboardProps {
    summary: SummaryData;
    categorySummary: CategoryTotal[];
    currency: string;
}

const CATEGORY_EMOJIS: Record<string, string> = {
    Food: "🍔",
    Travel: "✈️",
    Accommodation: "🏨",
    Shopping: "🛍",
    Entertainment: "🎉",
    Transport: "🚕",
    Other: "📦",
};

const CATEGORY_COLORS: Record<string, string> = {
    Food: "bg-orange-500",
    Travel: "bg-blue-500",
    Accommodation: "bg-purple-500",
    Shopping: "bg-pink-500",
    Entertainment: "bg-rose-500",
    Transport: "bg-cyan-500",
    Other: "bg-slate-500",
};

function formatAmount(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency || "INR"} ${amount.toFixed(0)}`;
    }
}

export function ExpenseSummaryDashboard({ summary, categorySummary, currency }: ExpenseSummaryDashboardProps) {
    const { totalExpenses, totalMembers, totalEntries, averagePerMember } = summary;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Expenses */}
                <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground font-medium block">Total Expenses</span>
                        <span className="text-2xl font-bold text-foreground">
                            {formatAmount(totalExpenses, currency)}
                        </span>
                    </div>
                </div>

                {/* Total Members */}
                <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground font-medium block">Total Members</span>
                        <span className="text-2xl font-bold text-foreground">
                            {totalMembers} {totalMembers === 1 ? "Member" : "Members"}
                        </span>
                    </div>
                </div>

                {/* Total Entries */}
                <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Receipt className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground font-medium block">Total Entries</span>
                        <span className="text-2xl font-bold text-foreground">
                            {totalEntries} {totalEntries === 1 ? "Expense" : "Expenses"}
                        </span>
                    </div>
                </div>

                {/* Average Per Member */}
                <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Coins className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground font-medium block">Average Per Member</span>
                        <span className="text-2xl font-bold text-foreground">
                            {formatAmount(averagePerMember, currency)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Category Breakdown</h3>
                
                {categorySummary.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No expenses available.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {categorySummary.map((item) => {
                            const emoji = CATEGORY_EMOJIS[item.category] || "📦";
                            const colorClass = CATEGORY_COLORS[item.category] || "bg-slate-500";
                            const percentage = totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0;

                            return (
                                <div key={item.category} className="p-4 border border-border rounded-lg bg-muted/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl" role="img" aria-label={item.category}>
                                                {emoji}
                                            </span>
                                            <span className="font-semibold text-foreground text-sm">
                                                {item.category}
                                            </span>
                                        </div>
                                        <span className="font-bold text-foreground text-sm">
                                            {formatAmount(item.totalAmount, currency)}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {percentage.toFixed(0)}% of total
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
