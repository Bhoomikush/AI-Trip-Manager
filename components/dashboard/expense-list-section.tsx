"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet, Plus, Calendar, User, Trash2 } from "lucide-react";
import { deleteExpense } from "@/lib/trips";
import { AnimatePresence, motion } from "framer-motion";

interface Profile {
    id: string;
    name: string;
    email: string;
    avatar_url?: string | null;
}

interface Expense {
    id: string;
    trip_id: string;
    paid_by: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    expense_date: string;
    created_at: string;
    paid_by_profile?: Profile | null;
}

interface ExpenseListSectionProps {
    tripId: string;
    expenses: Expense[];
    totalMembers: number;
}

const categoryStyles: Record<string, string> = {
    Food: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    Travel: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Accommodation: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Shopping: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    Entertainment: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    Transport: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    Other: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

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

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function formatAddedDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

export function ExpenseListSection({ tripId, expenses, totalMembers }: ExpenseListSectionProps) {
    const [localExpenses, setLocalExpenses] = useState<Expense[]>(expenses);
    const [expenseIdToDelete, setExpenseIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLocalExpenses(expenses);
    }, [expenses]);

    async function handleConfirmDelete() {
        const idToDelete = expenseIdToDelete;
        if (!idToDelete) return;
        setIsDeleting(true);
        setError(null);

        // Optimistic UI Update
        const backup = [...localExpenses];
        setLocalExpenses(prev => prev.filter(e => e.id !== idToDelete));
        setExpenseIdToDelete(null);

        try {
            await deleteExpense(idToDelete);
        } catch (err) {
            // Rollback optimistic update
            setLocalExpenses(backup);
            setError(err instanceof Error ? err.message : "Failed to delete expense.");
        } finally {
            setIsDeleting(false);
        }
    }

    if (localExpenses.length === 0) {
        return (
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6 text-center py-16 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative mx-auto h-16 w-16 mb-4">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-sm mx-auto">
                        <Wallet className="h-8 w-8" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">No expenses added yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        Keep track of your group budget, lodging, dining, and other trip expenses here.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        href={`/dashboard/trips/${tripId}/expenses/new`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
                    >
                        <Plus className="h-4 w-4" />
                        Add First Expense
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary/70" />
                    Trip Expenses
                </h2>
                <Link
                    href={`/dashboard/trips/${tripId}/expenses/new`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-border rounded-lg bg-card hover:bg-muted/40 transition text-foreground"
                >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    Add Expense
                </Link>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {localExpenses.map((expense) => {
                    const catStyle = categoryStyles[expense.category] || categoryStyles.Other;
                    const paidByName = expense.paid_by_profile?.name || "Unknown Member";

                    return (
                        <div
                            key={expense.id}
                            className="p-4 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition space-y-3"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                                        {expense.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${catStyle}`}>
                                            {expense.category}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(expense.expense_date)}
                                        </span>
                                    </div>
                                    {totalMembers > 0 && (
                                        <p className="text-xs text-muted-foreground pt-1">
                                            <span className="font-semibold text-foreground">Split:</span>{" "}
                                            {formatAmount(expense.amount / totalMembers, expense.currency)} × {totalMembers} members
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-foreground text-base sm:text-lg whitespace-nowrap">
                                        {formatAmount(expense.amount, expense.currency)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground flex-wrap gap-y-2">
                                <span className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5 text-muted-foreground/75" />
                                    Paid by <span className="font-medium text-foreground">{paidByName}</span>
                                </span>
                                <div className="flex items-center gap-3">
                                    <span>
                                        Added on {formatAddedDate(expense.created_at)}
                                    </span>
                                    <Link
                                        href={`/dashboard/trips/${tripId}/expenses/${expense.id}/edit`}
                                        className="font-semibold text-primary hover:underline transition"
                                    >
                                        Edit
                                    </Link>
                                    <span className="text-border">|</span>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            setExpenseIdToDelete(expense.id);
                                        }}
                                        className="font-semibold text-muted-foreground hover:text-destructive transition cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Custom Modal Confirmation Dialog Overlay */}
            <AnimatePresence>
                {expenseIdToDelete && (
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
                                <h3 className="text-lg font-bold text-foreground">Delete Expense?</h3>
                                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/15 text-destructive border border-destructive/20 rounded-lg text-xs">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => {
                                        setExpenseIdToDelete(null);
                                        setError(null);
                                    }}
                                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-sm font-medium transition disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
