"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip, updateTrip } from "@/lib/trips";

interface TripFormProps {
    mode?: "create" | "edit";
    initialData?: {
        id: string;
        title: string;
        destination: string;
        description?: string | null;
        start_date: string;
        end_date: string;
        budget?: number | null;
        currency?: string;
        status: string;
    };
}

export function CreateTripForm({ mode = "create", initialData }: TripFormProps) {
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
        const status = formData.get("status") as string || "planning";

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
            if (mode === "edit" && initialData) {
                await updateTrip({
                    id: initialData.id,
                    title,
                    destination,
                    description: description || undefined,
                    start_date: startDate,
                    end_date: endDate,
                    budget: budgetInput ? parseFloat(budgetInput) : undefined,
                    currency,
                    status,
                });
                router.push(`/dashboard/trips/${initialData.id}`);
            } else {
                await createTrip({
                    title,
                    destination,
                    description: description || undefined,
                    start_date: startDate,
                    end_date: endDate,
                    budget: budgetInput ? parseFloat(budgetInput) : undefined,
                    currency,
                });
                router.push("/dashboard");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
            setLoading(false);
        }
    }

    const isEdit = mode === "edit";

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
                    defaultValue={initialData?.title}
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
                    defaultValue={initialData?.destination}
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
                        defaultValue={initialData?.start_date}
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
                        defaultValue={initialData?.end_date}
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
                        defaultValue={initialData?.budget ?? ""}
                        placeholder="e.g. 25000"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="currency" className="text-sm font-medium text-foreground">Currency</label>
                    <select
                        id="currency"
                        name="currency"
                        defaultValue={initialData?.currency ?? "INR"}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="INR">INR (₹)</option>
                    </select>
                </div>
            </div>

            {isEdit && (
                <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium text-foreground">Status *</label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={initialData?.status}
                        required
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="planning">Planning</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">Description / Notes</label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={initialData?.description ?? ""}
                    placeholder="Describe your trip goals or plans..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => {
                        if (isEdit && initialData) {
                            router.push(`/dashboard/trips/${initialData.id}`);
                        } else {
                            router.push("/dashboard");
                        }
                    }}
                    className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/95 disabled:opacity-50"
                >
                    {loading ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Trip")}
                </button>
            </div>
        </form>
    );
}
