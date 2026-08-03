"use client";

import { Coins, User } from "lucide-react";
import { MemberBalance } from "@/lib/trips";

interface TripBalancesSectionProps {
    balances: MemberBalance[];
    currency: string;
}

function formatAmount(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
        }).format(Math.abs(amount));
    } catch {
        return `${currency || "INR"} ${Math.abs(amount)}`;
    }
}

export function TripBalancesSection({ balances, currency }: TripBalancesSectionProps) {
    if (balances.length === 0) {
        return (
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4 text-center py-8">
                <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Coins className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">No balances available yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary/70" />
                    Trip Balances
                </h2>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {balances.map((balance) => {
                    const isPositive = balance.netBalance > 0;
                    const isNegative = balance.netBalance < 0;
                    const isZero = balance.netBalance === 0;

                    let badgeClass = "bg-slate-500/10 text-slate-500 border-slate-500/20";
                    let balanceText = "Settled";

                    if (isPositive) {
                        badgeClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                        balanceText = `Gets back ${formatAmount(balance.netBalance, currency)}`;
                    } else if (isNegative) {
                        badgeClass = "bg-destructive/10 text-destructive border-destructive/20";
                        balanceText = `Owes ${formatAmount(balance.netBalance, currency)}`;
                    }

                    return (
                        <div
                            key={balance.profileId}
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10"
                        >
                            <div className="flex items-center gap-3">
                                {balance.avatarUrl ? (
                                    <img
                                        src={balance.avatarUrl}
                                        alt={balance.name}
                                        className="h-9 w-9 rounded-full object-cover border border-border"
                                    />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-border text-primary font-bold text-sm">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                                <div>
                                    <span className="font-semibold text-foreground text-sm block">
                                        {balance.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground block">
                                        Paid: {formatAmount(balance.totalPaid, currency)} • Owed: {formatAmount(balance.totalOwed, currency)}
                                    </span>
                                </div>
                            </div>

                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${badgeClass}`}>
                                {balanceText}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
