"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateExpense } from "@/lib/trips";

interface ExpenseData {
    id: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    expense_date: string;
}

interface EditExpenseFormProps {
    tripId: string;
    expense: ExpenseData;
}

const CATEGORIES = [
    "Food",
    "Travel",
    "Accommodation",
    "Shopping",
    "Entertainment",
    "Transport",
    "Other",
];

export function EditExpenseForm({ tripId, expense }: EditExpenseFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Format initial date value for the date input (YYYY-MM-DD)
    const initialDate = expense.expense_date ? new Date(expense.expense_date).toISOString().split("T")[0] : "";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const amountInput = formData.get("amount") as string;
        const category = formData.get("category") as string;
        const expenseDate = formData.get("expense_date") as string;

        // Validation
        if (!title || !title.trim()) {
            setError("Title is required.");
            setLoading(false);
            return;
        }

        const amount = parseFloat(amountInput);
        if (isNaN(amount) || amount <= 0) {
            setError("Amount must be a positive number greater than 0.");
            setLoading(false);
            return;
        }

        if (!category) {
            setError("Please select a category.");
            setLoading(false);
            return;
        }

        if (!expenseDate) {
            setError("Expense date is required.");
            setLoading(false);
            return;
        }

        try {
            await updateExpense({
                id: expense.id,
                title,
                amount,
                category,
                expenseDate,
            });
            router.push(`/dashboard/trips/${tripId}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl bg-card border border-border p-6 rounded-xl shadow-sm">
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">Expense Title *</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    defaultValue={expense.title}
                    placeholder="e.g. Dinner at the beach"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium text-foreground">Amount *</label>
                    <input
                        id="amount"
                        name="amount"
                        type="number"
                        step="any"
                        required
                        defaultValue={expense.amount}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="currency-display" className="text-sm font-medium text-foreground">Currency</label>
                    <input
                        id="currency-display"
                        type="text"
                        disabled
                        value={`${expense.currency} (Non-editable)`}
                        className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed opacity-75"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium text-foreground">Category *</label>
                    <select
                        id="category"
                        name="category"
                        required
                        defaultValue={expense.category}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="expense_date" className="text-sm font-medium text-foreground">Expense Date *</label>
                    <input
                        id="expense_date"
                        name="expense_date"
                        type="date"
                        required
                        defaultValue={initialDate}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.push(`/dashboard/trips/${tripId}`)}
                    className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/95 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
