import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="px-6 pb-20 pt-40">
            <div className="mx-auto max-w-4xl text-center">
                <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                    Plan group trips together, powered by AI
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
                    One shared workspace instead of five scattered apps — itinerary,
                    expenses, and collaboration, all in one place.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button size="lg" className="gap-2">
                        Start Planning
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2">
                        <PlayCircle className="h-4 w-4" />
                        Watch Demo
                    </Button>
                </div>
            </div>

            <div className="mx-auto mt-16 max-w-5xl">
                <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-muted/40">
                    <span className="text-sm text-muted-foreground">
                        Dashboard preview placeholder
                    </span>
                </div>
            </div>
        </section>
    );
}