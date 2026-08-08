import { getPendingInvitations, PendingTripInvitation } from "@/lib/trips";
import { CheckCircle2 } from "lucide-react";
import { RealtimeSync } from "@/components/dashboard/realtime-sync";

export async function PendingInvitations() {
    const invitations = await getPendingInvitations();

    if (!invitations || invitations.length === 0) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center gap-4">
                <RealtimeSync />
                <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500 shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">You're all caught up!</h2>
                    <p className="text-sm text-muted-foreground">No pending trip invitations at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border p-6 bg-white dark:bg-neutral-900">
            <RealtimeSync />
            <h2 className="text-xl font-semibold mb-4 mt-2">
                Pending Invitations
            </h2>

            <div className="space-y-3">
                {invitations.map((invite: PendingTripInvitation) => (
                    <div
                        key={invite.id}
                        className="flex items-center justify-between border rounded-lg p-4"
                    >
                        <div>
                            <p className="font-medium">
                                {invite.trip?.title || "Trip"}
                            </p>

                            <p className="text-sm text-gray-500">
                                Invited as {invite.role || "viewer"}
                            </p>
                        </div>

                        <div className="space-x-2">
                            <button className="px-4 py-2 rounded-lg bg-green-600 text-white">
                                Accept
                            </button>

                            <button className="px-4 py-2 rounded-lg border">
                                Decline
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}