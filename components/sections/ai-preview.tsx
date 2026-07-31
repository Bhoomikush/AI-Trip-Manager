import { Sparkles, Wand2, Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAMPLE_ITINERARY = [
    { day: "Day 1", items: ["Beach", "Fort", "Dinner"] },
    { day: "Day 2", items: ["Water Sports", "Cafe"] },
    { day: "Day 3", items: ["Shopping", "Return"] },
];

const BENEFITS = [
    { icon: Sparkles, text: "Smart itinerary generation" },
    { icon: Wand2, text: "Personalized suggestions" },
    { icon: ListChecks, text: "Optimized daily plans" },
    { icon: Clock, text: "Saves hours of planning" },
];

export function AIPreview() {
    return (
        <section className="px-6 py-24">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                    <span className="text-sm font-medium text-primary">
                        AI-Powered
                    </span>
                    <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Let AI plan your trip in seconds
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Answer a few quick questions and Tripzy generates a full,
                        day-by-day itinerary tailored to your group — no research
                        required.
                    </p>
                    <div className="mt-8 space-y-4">
                        {BENEFITS.map((benefit) => (
                            <div key={benefit.text} className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                    <benefit.icon className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                    {benefit.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <h3 className="font-semibold text-foreground">Plan your trip</h3>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label
                                htmlFor="destination"
                                className="text-sm font-medium text-foreground"
                            >
                                Destination
                            </label>
                            <input
                                id="destination"
                                type="text"
                                placeholder="e.g. Goa, India"
                                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="duration"
                                className="text-sm font-medium text-foreground"
                            >
                                Trip Duration
                            </label>
                            <input
                                id="duration"
                                type="text"
                                placeholder="e.g. 3 days"
                                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="budget"
                                className="text-sm font-medium text-foreground"
                            >
                                Budget
                            </label>
                            <input
                                id="budget"
                                type="text"
                                placeholder="e.g. ₹15,000 per person"
                                className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="travelStyle"
                                className="text-sm font-medium text-foreground"
                            >
                                Travel Style
                            </label>
                            <select
                                id="travelStyle"
                                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option>Relaxed</option>
                                <option>Balanced</option>
                                <option>Packed</option>
                            </select>
                        </div>

                        <Button className="mt-2 w-full">Generate Itinerary</Button>

                        <div className="mt-6 space-y-4 rounded-xl border border-border bg-muted/30 p-4">
                            <p className="text-xs font-medium text-muted-foreground">
                                Sample generated itinerary
                            </p>
                            {SAMPLE_ITINERARY.map((plan) => (
                                <div key={plan.day}>
                                    <p className="text-sm font-semibold text-foreground">
                                        {plan.day}
                                    </p>
                                    <ul className="mt-1 space-y-1">
                                        {plan.items.map((item) => (
                                            <li key={item} className="text-sm text-muted-foreground">
                                                • {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}