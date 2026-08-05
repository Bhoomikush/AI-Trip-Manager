import {
    Sparkles,
    Receipt,
    Users,
    ScanLine,
    MapPin,
    LayoutDashboard,
    Check,
} from "lucide-react";

interface FeatureItem {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    bullets: string[];
}

const FEATURES: FeatureItem[] = [
    {
        icon: Sparkles,
        title: "AI Trip Planner",
        description:
            "Generate smart itineraries, discover hidden local spots, and build plans optimized for your travel schedule.",
        bullets: ["Generate smart itineraries", "Suggest places", "Create daily schedules"],
    },
    {
        icon: Receipt,
        title: "Smart Expense Split",
        description:
            "Keep financial track simple. Add shared bills, split expenses flexibly, and check remaining balances.",
        bullets: ["Split equally", "Custom split", "Track balances"],
    },
    {
        icon: Users,
        title: "Collaborative Planning",
        description:
            "Plan travel together in a single collaborative dashboard. Co-edit routes and coordinate effortlessly.",
        bullets: ["Invite friends", "Live collaboration", "Shared workspace"],
    },
    {
        icon: ScanLine,
        title: "Receipt Scanner",
        description:
            "Upload receipts on the go. Automatically parse amounts and line items to auto-fill your trip expenses.",
        bullets: ["Scan receipts", "Auto-fill expenses", "Save time"],
    },
    {
        icon: MapPin,
        title: "Interactive Maps",
        description:
            "Pin destinations, explore curated local recommendations, and view all travel stops on a unified map.",
        bullets: ["Save locations", "Open destinations", "Explore nearby places"],
    },
    {
        icon: LayoutDashboard,
        title: "Dashboard",
        description:
            "Track all details of your journey. Monitor activity logs, trip analytics, and budgets in real-time.",
        bullets: ["Trips", "Expenses", "Activity & Analytics"],
    },
];

interface FeatureCardProps {
    feature: FeatureItem;
}

function FeatureCard({ feature }: FeatureCardProps) {
    const IconComponent = feature.icon;
    return (
        <div className="group relative flex flex-col justify-between h-full bg-card border border-border/40 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
            <div>
                {/* Icon Wrapper */}
                <div className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <IconComponent className="w-5.5 h-5.5" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-heading font-extrabold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs font-medium text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                </p>
            </div>

            <div>
                {/* Divider */}
                <div className="h-[1px] bg-border/40 w-full mb-5" />

                {/* Feature Bullets */}
                <ul className="space-y-2.5">
                    {feature.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-center text-xs font-semibold text-muted-foreground/90">
                            <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0 stroke-[2.5]" />
                            {bullet}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export function Features() {
    return (
        <section id="features" className="px-6 py-24 bg-transparent relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary mb-4 uppercase tracking-widest">
                        Capabilities
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground">
                        Everything you need to plan trips together
                    </h2>
                    <p className="mx-auto mt-4 text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
                        Tripzy combines planning, collaboration, AI, maps and expense management into one powerful, cohesive workspace.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map((feature) => (
                        <FeatureCard key={feature.title} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}