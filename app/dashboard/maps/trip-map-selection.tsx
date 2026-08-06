"use client";

import { useState } from "react";
import { TripMap } from "@/components/dashboard/trip-map";

interface SimpleTrip {
    id: string;
    title: string;
    destination: string;
}

export function TripMapSelection({ trips }: { trips: SimpleTrip[] }) {
    const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || "");
    const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label htmlFor="trip-select" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
                    Select Trip:
                </label>
                <select
                    id="trip-select"
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full sm:w-64 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground outline-none focus:border-primary transition"
                >
                    {trips.map((trip) => (
                        <option key={trip.id} value={trip.id}>
                            {trip.title} ({trip.destination})
                        </option>
                    ))}
                </select>
            </div>

            {selectedTrip && (
                <div className="h-[500px] rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                    <TripMap
                        tripId={selectedTrip.id}
                        tripTitle={selectedTrip.title}
                        destination={selectedTrip.destination}
                        className="h-full w-full"
                    />
                </div>
            )}
        </div>
    );
}
