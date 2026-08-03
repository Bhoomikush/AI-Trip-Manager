"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip } from "@/lib/trips";

export function CreateTripForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        
        // Extract inputs from form data
        const title = formData.get("title") as string;
        const destination = formData.get("destination") as string;
        const description = formData.get("description") as string;
        const startDate = formData.get("start_date") as string;
        const endDate = formData.get("end_date") as string;
        const budgetInput = formData.get("budget") as string;
        const currency = formData.get("currency") as string;

        // Validation 1: Date Range Check
        if (new Date(endDate) < new Date(startDate)) {
            setError("End date cannot be earlier than start date.");
            setLoading(false);
            return;
        }

        // Validation 2: Negative Budget Check
        if (budgetInput && parseFloat(budgetInput) < 0) {
            setError("Budget cannot be negative.");
            setLoading(false);
            return;
        }

        try {
            await createTrip({
                title,
                destination,
                description: description || undefined,
                start_date: startDate,
                end_date: endDate,
                budget: budgetInput ? parseFloat(budgetInput) : undefined,
                currency,
            });

            // Redirect back to dashboard upon successful creation
            router.push("/dashboard");
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
                <label htmlFor="title" className="text-sm font-medium text-foreground">Trip Title *</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    placeholder="e.g. Goa Getaway"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="destination" className="text-sm font-medium text-foreground">Destination *</label>
                <input
                    id="destination"
                    name="destination"
                    type="text"
                    required
                    placeholder="e.g. Goa, India"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="start_date" className="text-sm font-medium text-foreground">Start Date *</label>
                    <input
                        id="start_date"
                        name="start_date"
                        type="date"
                        required
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="end_date" className="text-sm font-medium text-foreground">End Date *</label>
                    <input
                        id="end_date"
                        name="end_date"
                        type="date"
                        required
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="budget" className="text-sm font-medium text-foreground">Budget</label>
                    <input
                        id="budget"
                        name="budget"
                        type="number"
                        min="0"
                        placeholder="e.g. 25000"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="currency" className="text-sm font-medium text-foreground">Currency</label>
                    <select
                        id="currency"
                        name="currency"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="INR">INR (₹)</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">Description / Notes</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Describe your trip goals or plans..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/95 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Trip"}
                </button>
            </div>
        </form>
    );
}
