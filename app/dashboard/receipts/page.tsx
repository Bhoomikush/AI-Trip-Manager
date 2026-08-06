import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getTrips } from "@/lib/trips";
import { Receipt, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function ReceiptsPage() {
    const user = await currentUser();
    if (!user) return null;

    const trips = await getTrips();
    const tripIds = trips.map((t) => t.id);

    let receipts: any[] = [];
    if (tripIds.length > 0) {
        const { data } = await supabaseAdmin
            .from("expenses")
            .select("id, title, amount, receipt_url, created_at, currency, trip_id")
            .in("trip_id", tripIds)
            .not("receipt_url", "is", null);
        receipts = data || [];
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">Receipts</h2>
                <p className="text-sm text-muted-foreground">Scanned receipts and invoices from your trip expenses.</p>
            </div>

            {receipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-border rounded-xl bg-card">
                    <div className="rounded-full bg-primary/10 p-4 mb-4 text-primary">
                        <Receipt className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-base text-foreground mb-1">
                        No receipts scanned yet
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs">
                        Upload or scan receipt documents when adding expenses to your trips.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {receipts.map((receipt) => {
                        const trip = trips.find((t) => t.id === receipt.trip_id);
                        return (
                            <div key={receipt.id} className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bold text-foreground text-sm truncate pr-2">
                                            {receipt.title}
                                        </h3>
                                        <span className="font-bold text-primary text-sm whitespace-nowrap">
                                            {receipt.currency || "INR"} {receipt.amount}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Trip: <span className="font-medium text-foreground">{trip?.title || "Unknown"}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Uploaded: <span className="font-medium text-foreground">{new Date(receipt.created_at).toLocaleDateString()}</span>
                                    </p>
                                </div>
                                <a
                                    href={receipt.receipt_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition text-xs font-semibold"
                                >
                                    View Receipt Document
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
