import { Route, Star, MapPin, Navigation } from "lucide-react";

const ROUTE_STEPS = ["Hotel", "Baga Beach", "Fort Aguada", "Thalassa", "Dudhsagar Falls"];

const ROUTE_STATS = [
    { label: "Estimated Time", value: "6h 20m" },
    { label: "Total Distance", value: "42 km" },
    { label: "Stops", value: "5" },
];

const SAVED_PLACES = ["Baga Beach", "Fontainhas", "Chapora Fort", "Candolim Beach"];

const BENEFITS = [
    {
        icon: Route,
        title: "Smart Route Optimization",
        description: "Tripzy orders your stops to minimize travel time.",
    },
    {
        icon: Star,
        title: "Save Favorite Places",
        description: "Bookmark spots you want to visit, all in one list.",
    },
    {
        icon: MapPin,
        title: "Discover Nearby Attractions",
        description: "See what's worth visiting near your saved stops.",
    },
    {
        icon: Navigation,
        title: "One-Tap Navigation",
        description: "Jump straight into directions for any stop.",
    },
];

export function MapsPreview() {
    return (
        <section className="px-6 py-24">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                    <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Navigate smarter. Travel better.
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Plan your complete journey with intelligent route planning. Save
                        attractions, organize destinations, reduce travel time, and
                        explore everything in one place.
                    </p>

                    <div className="mt-8 space-y-5">
                        {BENEFITS.map((benefit) => (
                            <div key={benefit.title} className="flex gap-3">
                                <benefit.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {benefit.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card shadow-sm">
                    {/* Top card */}
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Goa Friends Trip
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    3 days · 5 destinations
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                            AI Optimized Route
                        </span>
                    </div>

                    {/* Mini map illustration */}
                    <div className="border-b border-border p-4">
                        <div className="overflow-hidden rounded-lg bg-muted/40">
                            <svg viewBox="0 0 400 220" className="h-48 w-full">
                                <title>Optimized route across 5 stops</title>

                                <pattern
                                    id="mapDots"
                                    width="20"
                                    height="20"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <circle cx="1" cy="1" r="1" className="fill-border" />
                                </pattern>
                                <rect width="400" height="220" fill="url(#mapDots)" />

                                <path
                                    d="M40,170 Q90,140 140,110 Q170,95 200,95 Q220,75 240,60 Q290,45 340,40"
                                    className="fill-none stroke-primary/50"
                                    strokeWidth="2.5"
                                    strokeDasharray="6 6"
                                />

                                <circle cx="40" cy="170" r="6" className="fill-primary" />
                                <circle cx="140" cy="110" r="6" className="fill-primary" />
                                <circle cx="200" cy="95" r="6" className="fill-primary" />
                                <circle cx="240" cy="60" r="6" className="fill-primary" />
                                <circle
                                    cx="340"
                                    cy="40"
                                    r="7"
                                    className="fill-primary stroke-card"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>📍 Hotel</span>
                            <span>📍 Baga Beach</span>
                            <span>📍 Fort Aguada</span>
                            <span>📍 Thalassa</span>
                            <span>📍 Dudhsagar Falls</span>
                        </div>
                    </div>

                    {/* Today's Route */}
                    <div className="border-b border-border px-5 py-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Today's Route
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm text-foreground">
                            {ROUTE_STEPS.map((step, i) => (
                                <span key={step} className="flex items-center gap-1.5">
                                    {step}
                                    {i < ROUTE_STEPS.length - 1 && (
                                        <span className="text-muted-foreground">→</span>
                                    )}
                                </span>
                            ))}
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {ROUTE_STATS.map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-sm font-semibold text-foreground">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Saved Places */}
                    <div className="px-5 py-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Saved Places
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {SAVED_PLACES.map((place) => (
                                <span
                                    key={place}
                                    className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted"
                                >
                                    ⭐ {place}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}