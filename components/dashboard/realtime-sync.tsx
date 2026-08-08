"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { RefreshCw, AlertCircle } from "lucide-react";

interface RealtimeSyncProps {
    tripId?: string;
}

export function RealtimeSync({ tripId }: RealtimeSyncProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

    useEffect(() => {
        let active = true;
        let channel: any = null;
        let isClosedNormally = false;

        const channelName = tripId ? `trip-sync-${tripId}` : 'dashboard-sync';

        async function initSync() {
            try {
                setStatus("connecting");
                const token = await getToken({ template: "supabase" });
                
                if (!active) return;

                if (token) {
                    supabase.realtime.setAuth(token);
                } else {
                    console.warn(`[Realtime]
Channel: ${channelName}
Status: WARNING
Message: No Supabase token retrieved from Clerk. Row-Level Security policies may reject subscription.`);
                }

                channel = supabase.channel(channelName);

                if (tripId) {
                    channel
                        // 1. trip_members
                        .on(
                            "postgres_changes",
                            {
                                event: "*",
                                schema: "public",
                                table: "trip_members",
                                filter: `trip_id=eq.${tripId}`
                            },
                            (payload: any) => {
                                console.log(`[Realtime]
Channel: ${channelName}
Table: trip_members
Event: ${payload.eventType}
Timestamp: ${new Date().toISOString()}`);
                                router.refresh();
                            }
                        )
                        // 2. trip_invitations
                        .on(
                            "postgres_changes",
                            {
                                event: "*",
                                schema: "public",
                                table: "trip_invitations",
                                filter: `trip_id=eq.${tripId}`
                            },
                            (payload: any) => {
                                console.log(`[Realtime]
Channel: ${channelName}
Table: trip_invitations
Event: ${payload.eventType}
Timestamp: ${new Date().toISOString()}`);
                                router.refresh();
                            }
                        )
                        // 3. expenses
                        .on(
                            "postgres_changes",
                            {
                                event: "*",
                                schema: "public",
                                table: "expenses",
                                filter: `trip_id=eq.${tripId}`
                            },
                            (payload: any) => {
                                console.log(`[Realtime]
Channel: ${channelName}
Table: expenses
Event: ${payload.eventType}
Timestamp: ${new Date().toISOString()}`);
                                router.refresh();
                            }
                        )
                        // 4. expense_shares
                        .on(
                            "postgres_changes",
                            {
                                event: "*",
                                schema: "public",
                                table: "expense_shares"
                            },
                            (payload: any) => {
                                console.log(`[Realtime]
Channel: ${channelName}
Table: expense_shares
Event: ${payload.eventType}
Timestamp: ${new Date().toISOString()}`);
                                router.refresh();
                            }
                        )
                        // 5. trip_itineraries
                        .on(
                            "postgres_changes",
                            {
                                event: "*",
                                schema: "public",
                                table: "trip_itineraries",
                                filter: `trip_id=eq.${tripId}`
                            },
                            (payload: any) => {
                                console.log(`[Realtime]
Channel: ${channelName}
Table: trip_itineraries
Event: ${payload.eventType}
Timestamp: ${new Date().toISOString()}`);
                                router.refresh();
                            }
                        );
                } else {
                    // Dashboard Sync
                    channel.on(
                        "postgres_changes",
                        {
                            event: "*",
                            schema: "public",
                            table: "trip_invitations",
                        },
                        (payload: any) => {
                            console.log(`[Realtime]
Channel: ${channelName}
Table: trip_invitations
Event: ${payload.eventType}
Timestamp: ${new Date().toISOString()}`);
                            router.refresh();
                        }
                    );
                }

                channel.subscribe((status: string, err: any) => {
                    if (!active) return;

                    const timestamp = new Date().toISOString();

                    if (status === "SUBSCRIBED") {
                        setStatus("connected");
                        console.log(`[Realtime]
Channel: ${channelName}
Status: SUBSCRIBED
Timestamp: ${timestamp}`);
                    } else if (status === "TIMED_OUT") {
                        setStatus("disconnected");
                        console.warn(`[Realtime]
Channel: ${channelName}
Status: TIMED_OUT
Timestamp: ${timestamp}${err ? `\nError: ${JSON.stringify(err)}` : ""}`);
                    } else if (status === "CHANNEL_ERROR") {
                        setStatus("disconnected");
                        console.error(`[Realtime]
Channel: ${channelName}
Status: CHANNEL_ERROR
Timestamp: ${timestamp}
Error: ${err ? JSON.stringify(err) : "Unknown error / Authorization failure"}`);
                    } else if (status === "CLOSED") {
                        setStatus("disconnected");
                        if (isClosedNormally) {
                            console.log(`[Realtime]
Channel: ${channelName}
Status: CLOSED
Timestamp: ${timestamp}
Info: Realtime channel closed normally.`);
                        } else {
                            console.warn(`[Realtime]
Channel: ${channelName}
Status: CLOSED
Timestamp: ${timestamp}
Warning: Realtime channel closed unexpectedly.`);
                        }
                    }
                });
            } catch (setupError: any) {
                if (!active) return;
                setStatus("disconnected");
                console.error(`[Realtime]
Channel: ${channelName}
Status: SETUP_ERROR
Timestamp: ${new Date().toISOString()}
Error: ${setupError?.message || setupError}`);
            }
        }

        initSync();

        return () => {
            active = false;
            isClosedNormally = true;
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [tripId, router, getToken]);

    if (!tripId) return null;

    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm transition-all duration-300">
            {status === "connected" && (
                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-550"></span>
                    </span>
                    Live
                </span>
            )}

            {status === "connecting" && (
                <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/40 animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin text-amber-550" />
                    Connecting
                </span>
            )}

            {status === "disconnected" && (
                <span className="flex items-center gap-1.5 text-stone-500 bg-stone-50 border-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-800">
                    <AlertCircle className="h-3 w-3 text-stone-500" />
                    Disconnected
                </span>
            )}
        </div>
    );
}

