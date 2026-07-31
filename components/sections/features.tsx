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
        <div className="group relative flex flex-col justify-between h-full bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(99,102,241,0.12)] hover:border-indigo-500 hover:-translate-y-2 transition-all duration-300">
            <div>
                {/* Icon Wrapper */}
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                    {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    {feature.description}
                </p>
            </div>

            <div>
                {/* Divider */}
                <div className="h-[1px] bg-slate-100 w-full mb-4" />

                {/* Feature Bullets */}
                <ul className="space-y-2.5">
                    {feature.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-center text-xs font-semibold text-slate-600">
                            <Check className="w-3.5 h-3.5 text-indigo-500 mr-2 flex-shrink-0 stroke-[3]" />
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
        <section className="px-6 py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4 uppercase tracking-wider">
                        Capabilities
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Everything You Need To Plan Trips Together
                    </h2>
                    <p className="mx-auto mt-4 text-base text-slate-500 leading-relaxed">
                        Tripzy combines planning, collaboration, AI, maps and expense management into one powerful platform.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature) => (
                        <FeatureCard key={feature.title} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}