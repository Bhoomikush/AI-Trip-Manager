"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "@/lib/expenses";

interface CreateExpenseFormProps {
    tripId: string;
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

const CURRENCIES = [
    { code: "INR", label: "INR (₹)" },
    { code: "USD", label: "USD ($)" },
    { code: "EUR", label: "EUR (€)" },
    { code: "GBP", label: "GBP (£)" },
];

export function CreateExpenseForm({ tripId }: CreateExpenseFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get today's date in YYYY-MM-DD format for default value
    const today = new Date().toISOString().split("T")[0];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const amountInput = formData.get("amount") as string;
        const currency = formData.get("currency") as string;
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

        if (!currency || currency.length !== 3) {
            setError("Please select a valid currency.");
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
            await createExpense({
                tripId,
                title,
                amount,
                currency,
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
                        placeholder="0.00"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="currency" className="text-sm font-medium text-foreground">Currency *</label>
                    <select
                        id="currency"
                        name="currency"
                        defaultValue="INR"
                        required
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        {CURRENCIES.map((cur) => (
                            <option key={cur.code} value={cur.code}>
                                {cur.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium text-foreground">Category *</label>
                    <select
                        id="category"
                        name="category"
                        required
                        defaultValue=""
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="" disabled>Select a category</option>
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
                        defaultValue={today}
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
                    {loading ? "Adding..." : "Add Expense"}
                </button>
            </div>
        </form>
    );
}
