"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Users, 
  Wallet, 
  Sparkles, 
  ScanLine, 
  MapPin, 
  Coins,
  LucideIcon,
  Activity as ActivityIcon
} from "lucide-react";

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

export interface CategoryConfig {
  icon: LucideIcon;
  colorClass: string;
}

export const CATEGORY_MAP: Record<ActivityCategory, CategoryConfig> = {
  trip: {
    icon: Plus,
    colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  expense: {
    icon: Wallet,
    colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  ai: {
    icon: Sparkles,
    colorClass: "bg-primary/10 text-primary border-primary/25",
  },
  member: {
    icon: Users,
    colorClass: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  },
  destination: {
    icon: MapPin,
    colorClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  },
  budget: {
    icon: Coins,
    colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  ocr: {
    icon: ScanLine,
    colorClass: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
};

interface RecentActivityProps {
  activities?: Activity[];
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Activity</h2>
          <p className="text-xs text-muted-foreground">Keep track of your group's latest travel updates.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-border rounded-xl bg-gradient-to-b from-muted/5 to-muted/20 flex-1 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
            <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 border border-primary/20 text-primary shadow-sm">
              <ActivityIcon className="h-8 w-8" />
            </div>
          </div>
          <h3 className="font-extrabold text-xl text-foreground mb-2 tracking-tight">No recent activity</h3>
          <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
            Activity details will appear here as you and your friends plan your trip and add expenses.
          </p>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { type: "spring" as const, stiffness: 300, damping: 25 }
        },
    };

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Recent Activity
        </h2>
        <p className="text-xs text-muted-foreground">
          Keep track of your group's latest travel updates.
        </p>
      </div>

      {/* Feed List */}
      <div className="relative pl-4 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-[1px] before:bg-border/60 flex-1 overflow-y-auto max-h-[480px] pr-1">
        <motion.ul 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {activities.map((activity) => {
            const config = CATEGORY_MAP[activity.category] || CATEGORY_MAP.trip;
            const Icon = config.icon;

            return (
              <motion.li 
                key={activity.id} 
                variants={itemVariants}
                className="group relative flex items-start gap-4 rounded-xl p-2.5 transition-colors hover:bg-muted/30"
              >
                {/* Timeline dot / avatar container */}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  <span>{activity.actor.fallback}</span>
                  
                  {/* Category icon badge layered on bottom-right corner */}
                  <div 
                    className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-card ${config.colorClass}`}
                    title={activity.category}
                  >
                    <Icon className="h-2 w-2" />
                  </div>
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground leading-relaxed break-words">
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {activity.actor.name}
                    </span>{" "}
                    {activity.action}{" "}
                    <span className="font-bold text-foreground">
                      {activity.target}
                    </span>
                  </p>
                  
                  {/* Time label */}
                  <span className="mt-1 block text-[10px] text-muted-foreground font-medium">
                    {activity.timestamp}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
