"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const TripMapInner = dynamic(
    () => import("./trip-map-inner"),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center min-h-[350px] bg-card border border-border rounded-xl p-6">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Initializing map...</p>
                </div>
            </div>
        ),
    }
);

interface TripMapProps {
    destination: string;
    tripTitle: string;
    tripId: string;
    className?: string;
}

export function TripMap({ destination, tripTitle, tripId, className = "" }: TripMapProps) {
    return (
        <TripMapInner
            destination={destination}
            tripTitle={tripTitle}
            tripId={tripId}
            className={className}
        />
    );
}
