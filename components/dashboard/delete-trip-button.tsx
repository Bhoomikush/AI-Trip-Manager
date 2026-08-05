"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTrip } from "@/lib/trips";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface DeleteTripButtonProps {
    tripId: string;
    tripTitle: string;
}

export function DeleteTripButton({ tripId, tripTitle }: DeleteTripButtonProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${tripTitle}"?\n\nThis action cannot be undone and will permanently remove all plans, budgets, and files associated with this trip.`
        );

        if (!confirmed) return;

        setLoading(true);

        try {
            await deleteTrip(tripId);
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            showToast(`Failed to delete trip: ${errorMessage}`, "error");
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-destructive/20 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Trash2 className="h-4 w-4" />
            {loading ? "Deleting..." : "Delete Trip"}
        </button>
    );
}
