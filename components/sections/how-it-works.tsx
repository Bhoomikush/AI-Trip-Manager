import {
    Plane,
    Users,
    Sparkles,
    CreditCard,
    Globe,
    Check,
} from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Plane,
        title: "Create Your Trip",
        description:
            "Start by adding destination, travel dates and estimated budget.",
        highlights: ["Destination", "Dates", "Budget"],
    },
    {
        number: "02",
        icon: Users,
        title: "Invite Friends",
        description:
            "Invite friends or family into one shared workspace.",
        highlights: ["Invite Link", "Shared Planning", "Live Collaboration"],
    },
    {
        number: "03",
        icon: Sparkles,
        title: "Plan with AI",
        description:
            "Generate smart itineraries and discover places.",
        highlights: ["AI Suggestions", "Daily Plans", "Hidden Gems"],
    },
    {
        number: "04",
        icon: CreditCard,
        title: "Track Expenses",
        description:
            "Split bills and manage every shared expense.",
        highlights: ["Equal Split", "Custom Split", "Balance Tracking"],
    },
    {
        number: "05",
        icon: Globe,
        title: "Enjoy Your Journey",
        description:
            "Travel stress-free while Tripzy keeps everything organized.",
        highlights: ["Maps", "Receipts", "Itinerary"],
    },
];

export function HowItWorks() {
    return (
        <section className="px-6 py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4 uppercase tracking-wider">
                        Workflow
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        How Tripzy Works
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
                        Plan your entire journey—from creating a trip to splitting expenses—in five simple steps.
                    </p>
                </div>

                {/* Timeline Grid */}
                <div className="relative z-0">
                    {/* Desktop Horizontal Connecting Line */}
                    <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-indigo-100/50 hidden md:block -z-10 -translate-y-1/2" />

                    <div className="flex flex-col md:grid md:grid-cols-5 gap-6 md:gap-4 lg:gap-6">
                        {steps.map((step, index) => {
                            const IconComponent = step.icon;
                            return (
                                <div key={step.number} className="flex flex-col h-full">
                                    {/* Premium Step Card */}
                                    <div className="group relative flex flex-col h-full bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-6px_rgba(99,102,241,0.15)] hover:border-indigo-500 hover:-translate-y-2 transition-all duration-300">
                                        
                                        {/* Header Row: Icon & Step Number */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                            <span className="text-4xl font-extrabold text-slate-100 group-hover:text-indigo-100 transition-colors duration-300 select-none">
                                                {step.number}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                                            {step.title}
                                        </h3>
                                        
                                        <p className="text-sm text-slate-500 mb-6 flex-grow leading-relaxed">
                                            {step.description}
                                        </p>

                                        {/* Divider */}
                                        <div className="h-[1px] bg-slate-100 w-full mb-4" />

                                        {/* Highlights Checklist */}
                                        <ul className="space-y-2.5">
                                            {step.highlights.map((highlight, hIdx) => (
                                                <li key={hIdx} className="flex items-center text-xs font-semibold text-slate-600">
                                                    <Check className="w-3.5 h-3.5 text-indigo-500 mr-2 flex-shrink-0 stroke-[3]" />
                                                    {highlight}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Mobile Connector */}
                                    {index < steps.length - 1 && (
                                        <div className="flex flex-col items-center my-4 md:hidden">
                                            <div className="w-0.5 h-8 bg-indigo-100" />
                                            <div className="text-indigo-500 -mt-1.5 font-bold">↓</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}