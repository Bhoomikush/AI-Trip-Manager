"use client";

import { useState } from "react";
import { ArrowRight, User, CheckCircle2 } from "lucide-react";
import { SettlementTransaction, settleUpTransaction } from "@/lib/trips";
import { AnimatePresence, motion } from "framer-motion";

interface SettlementPlanSectionProps {
    tripId: string;
    plan: SettlementTransaction[];
    currency: string;
}

function formatAmount(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
        }).format(amount);
    } catch {
        return `${currency || "INR"} ${amount}`;
    }
}

export function SettlementPlanSection({ tripId, plan, currency }: SettlementPlanSectionProps) {
    const [confirmTx, setConfirmTx] = useState<SettlementTransaction | null>(null);
    const [isSettling, setIsSettling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    async function handleConfirmSettle() {
        if (!confirmTx) return;
        setIsSettling(true);
        setError(null);
        try {
            await settleUpTransaction(tripId, confirmTx.from.id, confirmTx.to.id);
            setToast("Settlement completed successfully.");
            setConfirmTx(null);
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to settle payment.");
        } finally {
            setIsSettling(false);
        }
    }

    if (plan.length === 0) {
        return (
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4 text-center py-8">
                <div className="mx-auto h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">✔ Everyone is settled.</p>
                    <p className="text-xs text-muted-foreground">No payments are pending.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <span className="text-lg">💸</span>
                    Settlement Plan
                </h2>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {plan.map((tx, idx) => (
                    <div
                        key={idx}
                        className="p-4 rounded-lg border border-border bg-muted/10 flex flex-col justify-between space-y-4"
                    >
                        <div className="flex items-center justify-between gap-2">
                            {/* Payer */}
                            <div className="flex flex-col items-center text-center space-y-1 flex-1">
                                {tx.from.avatarUrl ? (
                                    <img
                                        src={tx.from.avatarUrl}
                                        alt={tx.from.name}
                                        className="h-10 w-10 rounded-full object-cover border border-border"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-border text-primary font-bold text-sm">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                                <span className="text-xs font-semibold text-foreground truncate max-w-[80px]">
                                    {tx.from.name}
                                </span>
                            </div>

                            {/* Arrow */}
                            <div className="flex flex-col items-center justify-center text-primary flex-shrink-0 px-1">
                                <ArrowRight className="h-5 w-5" />
                            </div>

                            {/* Receiver */}
                            <div className="flex flex-col items-center text-center space-y-1 flex-1">
                                {tx.to.avatarUrl ? (
                                    <img
                                        src={tx.to.avatarUrl}
                                        alt={tx.to.name}
                                        className="h-10 w-10 rounded-full object-cover border border-border"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-border text-primary font-bold text-sm">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                                <span className="text-xs font-semibold text-foreground truncate max-w-[80px]">
                                    {tx.to.name}
                                </span>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="text-center pt-2 border-t border-border/50 space-y-3">
                            <div className="space-y-0.5">
                                <span className="text-xs text-muted-foreground block font-medium">Pay</span>
                                <span className="text-lg font-bold text-foreground block">
                                    {formatAmount(tx.amount, currency)}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold">
                                    Pending Settlement
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setError(null);
                                    setConfirmTx(tx);
                                }}
                                className="w-full text-xs font-semibold px-3 py-1.5 border border-border rounded-lg bg-card hover:bg-muted/40 transition text-foreground cursor-pointer"
                            >
                                Settle Up
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Success Toast */}
            {toast && (
                <div className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{toast}</span>
                </div>
            )}

            {/* Confirmation Dialog Overlay */}
            <AnimatePresence>
                {confirmTx && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-card border border-border p-6 rounded-xl shadow-lg max-w-sm w-full mx-4 space-y-4"
                        >
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-foreground">Settle Up Payment?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Are you sure you want to mark this payment of <span className="font-semibold text-foreground">{formatAmount(confirmTx.amount, currency)}</span> from <span className="font-semibold text-foreground">{confirmTx.from.name}</span> to <span className="font-semibold text-foreground">{confirmTx.to.name}</span> as settled?
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-lg text-xs">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    disabled={isSettling}
                                    onClick={() => {
                                        setConfirmTx(null);
                                        setError(null);
                                    }}
                                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isSettling}
                                    onClick={handleConfirmSettle}
                                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
                                >
                                    {isSettling ? "Settling..." : "Confirm"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
