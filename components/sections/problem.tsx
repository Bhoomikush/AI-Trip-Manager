import {
  MessageCircle,
  MapPin,
  Receipt,
  StickyNote,
  HardDrive,
  Check,
  ArrowRight,
} from "lucide-react";

const PROBLEMS = [
  {
    icon: MessageCircle,
    app: "WhatsApp",
    problem: "Messages get lost.",
  },
  {
    icon: Receipt,
    app: "Splitwise",
    problem: "Expenses are separated.",
  },
  {
    icon: StickyNote,
    app: "Notes",
    problem: "Plans become outdated.",
  },
  {
    icon: MapPin,
    app: "Google Maps",
    problem: "Locations aren't shared properly.",
  },
  {
    icon: HardDrive,
    app: "Drive",
    problem: "Documents are scattered.",
  },
];

const SOLUTIONS = [
  "Planning",
  "AI Itinerary",
  "Expense Splitting",
  "Maps",
  "Receipts",
  "Collaboration",
];

export function Problem() {
  return (
    <section id="how-it-works" className="px-6 py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary mb-4 uppercase tracking-widest">
            The Reality
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground">
            Why group trip planning is so messy
          </h2>
          <p className="mx-auto mt-4 text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
            Planning a trip shouldn't require five different apps. Tripzy brings everything together into one cohesive, luxury workspace.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch mt-12">
          {/* Left Side: Without Tripzy */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="mb-6">
              <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-1">
                The Status Quo
              </span>
              <h3 className="text-xl font-heading font-extrabold text-foreground">
                Without Tripzy
              </h3>
            </div>
            
            <div className="space-y-4">
              {PROBLEMS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.app}
                    className="group flex items-center gap-4 bg-card border border-border/40 rounded-2xl p-5 shadow-sm hover:shadow hover:border-border transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-0.5">
                        {item.app}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.problem}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle: Arrow/Transition Indicator */}
          <div className="lg:col-span-1 flex items-center justify-center py-4 lg:py-0">
            <div className="flex lg:flex-col items-center gap-2 text-primary/70">
              <div className="w-8 h-[2px] lg:w-[2px] lg:h-12 bg-primary/20" />
              <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
              <div className="w-8 h-[2px] lg:w-[2px] lg:h-12 bg-primary/20" />
            </div>
          </div>

          {/* Right Side: With Tripzy */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="mb-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
                The Solution
              </span>
              <h3 className="text-xl font-heading font-extrabold text-primary">
                With Tripzy
              </h3>
            </div>

            <div className="group relative flex flex-col justify-between h-full bg-[#1B2424] border border-primary/20 rounded-3xl p-8 lg:p-10 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />

              <div>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-primary/15 border border-primary/30 text-primary mb-6 uppercase tracking-wider">
                  All-In-One Workspace
                </span>
                <h4 className="text-2xl lg:text-3xl font-heading font-extrabold tracking-tight mb-4 leading-tight text-foreground">
                  Tripzy combines everything.
                </h4>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed max-w-md mb-8">
                  Say goodbye to scattered planning. Tripzy brings all key components of travel into a single, unified workflow.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  {SOLUTIONS.map((sol) => (
                    <div key={sol} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/30">
                        <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {sol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom message */}
              <div className="relative border border-primary/10 rounded-2xl bg-primary/5 p-4 text-center mt-8">
                <span className="text-xs font-semibold text-primary">
                  ⚡ Everything organized in one place.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}