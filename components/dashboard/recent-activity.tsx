import React from "react";
import { 
  Plus, 
  Users, 
  Wallet, 
  Sparkles, 
  ScanLine, 
  MapPin, 
  Coins,
  LucideIcon 
} from "lucide-react";

// 1. Define strict TypeScript interfaces for our Activity model
export type ActivityCategory = 
  | "trip" 
  | "expense" 
  | "ai" 
  | "member" 
  | "destination" 
  | "budget"
  | "ocr";

export interface Activity {
  id: string;
  actor: {
    name: string;
    avatarUrl?: string;
    fallback: string;
  };
  action: string;
  target: string;
  category: ActivityCategory;
  timestamp: string;
}

// 2. Define category configuration for styling & icons mapping
export interface CategoryConfig {
  icon: LucideIcon;
  colorClass: string; // Tailored HSL theme colors (existing system)
}

export const CATEGORY_MAP: Record<ActivityCategory, CategoryConfig> = {
  trip: {
    icon: Plus,
    colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  expense: {
    icon: Wallet,
    colorClass: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },
  ai: {
    icon: Sparkles,
    colorClass: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground",
  },
  member: {
    icon: Users,
    colorClass: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  },
  destination: {
    icon: MapPin,
    colorClass: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  },
  budget: {
    icon: Coins,
    colorClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  ocr: {
    icon: ScanLine,
    colorClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
};

// 3. Mock data populated with realistic activities requested
export const DUMMY_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    actor: { name: "Bhoomi", fallback: "B" },
    action: "created a trip",
    target: "Goa Friends Trip",
    category: "trip",
    timestamp: "2 mins ago",
  },
  {
    id: "act-2",
    actor: { name: "Pawan", fallback: "P" },
    action: "joined the trip",
    target: "Goa Friends Trip",
    category: "member",
    timestamp: "10 mins ago",
  },
  {
    id: "act-3",
    actor: { name: "Riya", fallback: "R" },
    action: "added an expense for dinner at Thalassa",
    target: "₹4,200",
    category: "expense",
    timestamp: "25 mins ago",
  },
  {
    id: "act-4",
    actor: { name: "AI Planner", fallback: "AI" },
    action: "generated an itinerary for",
    target: "Manali Adventure",
    category: "ai",
    timestamp: "1 hour ago",
  },
  {
    id: "act-5",
    actor: { name: "Aman", fallback: "A" },
    action: "scanned a receipt",
    target: "receipt_thalassa.jpg",
    category: "ocr",
    timestamp: "2 hours ago",
  },
  {
    id: "act-6",
    actor: { name: "Bhoomi", fallback: "B" },
    action: "added a destination",
    target: "Solang Valley stop",
    category: "destination",
    timestamp: "4 hours ago",
  },
  {
    id: "act-7",
    actor: { name: "Pawan", fallback: "P" },
    action: "updated the budget for",
    target: "Manali Adventure",
    category: "budget",
    timestamp: "1 day ago",
  },
];

interface RecentActivityProps {
  activities?: Activity[];
}

export function RecentActivity({ activities = DUMMY_ACTIVITIES }: RecentActivityProps) {
  // If we have no activities, render a clean, user-friendly empty state
  if (activities.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-start">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Keep track of your group's latest travel updates.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="mt-4 font-semibold text-foreground">No recent activity</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Activities will appear here when you or your companions make changes to your trips.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Recent Activity
          </h2>
          <p className="text-sm text-muted-foreground">
            Keep track of your group's latest travel updates.
          </p>
        </div>
      </div>

      {/* Feed List */}
      <div className="relative pl-4 before:absolute before:bottom-0 before:left-[21px] before:top-4 before:w-[2px] before:bg-border">
        <ul className="space-y-6">
          {activities.map((activity, index) => {
            const config = CATEGORY_MAP[activity.category] || CATEGORY_MAP.trip;
            const Icon = config.icon;

            return (
              <li 
                key={activity.id} 
                className="group relative flex items-start gap-4 rounded-lg p-2 transition-all duration-300 hover:bg-muted/40"
              >
                {/* Timeline dot / avatar container */}
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  <span>{activity.actor.fallback}</span>
                  
                  {/* Category icon badge layered on bottom-right corner */}
                  <div 
                    className={`absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-card ${config.colorClass}`}
                    title={activity.category}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </div>
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground leading-normal break-words">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                      {activity.actor.name}
                    </span>{" "}
                    {activity.action}{" "}
                    <span className="font-semibold text-foreground">
                      {activity.target}
                    </span>
                  </p>
                  
                  {/* Time label */}
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {activity.timestamp}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
