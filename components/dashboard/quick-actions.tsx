"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Users,
    Sparkles,
    Wallet,
    MapPin,
    Coins,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface Trip {
    id: string;
    title: string;
}

interface QuickActionsProps {
    trips?: Trip[];
}

export function QuickActions({ trips = [] }: QuickActionsProps) {
    const { showToast } = useToast();
    const router = useRouter();
    const latestTrip = trips.length > 0 ? trips[0] : null;

    const handleActionClick = (actionTitle: string) => {
        if (!latestTrip) {
            showToast("Please create a trip first before using this action.", "info");
            return;
        }

        if (actionTitle === "Invite Friends") {
            router.push(`/dashboard/trips/${latestTrip.id}`);
        } else if (actionTitle === "AI Itinerary") {
            router.push(`/dashboard/trips/${latestTrip.id}#ai-itinerary-planner`);
        } else if (actionTitle === "Add Expense") {
            router.push(`/dashboard/trips/${latestTrip.id}/expenses/new`);
        } else if (actionTitle === "Nearby Places") {
            router.push(`/dashboard/trips/${latestTrip.id}`);
        } else if (actionTitle === "Settlements") {
            router.push(`/dashboard/trips/${latestTrip.id}`);
        }
    };

    const ACTIONS = [
        {
            title: "Create Trip",
            description: "Plan a new timeline",
            icon: Plus,
            href: "/dashboard/trips/new",
            colorClass: "text-blue-500",
            bgClass: "bg-blue-500/10",
        },
        {
            title: "Add Expense",
            description: "Record transaction",
            icon: Wallet,
            colorClass: "text-emerald-500",
            bgClass: "bg-emerald-500/10",
        },
        {
            title: "AI Itinerary",
            description: "Generate with Gemini",
            icon: Sparkles,
            colorClass: "text-primary",
            bgClass: "bg-primary/10",
        },
        {
            title: "Nearby Places",
            description: "OSM Explorer map",
            icon: MapPin,
            colorClass: "text-cyan-500",
            bgClass: "bg-cyan-500/10",
        },
        {
            title: "Invite Friends",
            description: "Manage companions",
            icon: Users,
            colorClass: "text-violet-500",
            bgClass: "bg-violet-500/10",
        },
        {
            title: "Settlements",
            description: "Clear group debts",
            icon: Coins,
            colorClass: "text-rose-500",
            bgClass: "bg-rose-500/10",
        },
    ];

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.04,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring" as const, stiffness: 280, damping: 20 }
        },
    };

    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                    Quick Actions
                </h2>
                <p className="text-xs text-muted-foreground">
                    Jump into your most common tasks.
                </p>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
            >
                {ACTIONS.map((action) => (
                    action.href ? (
                        <Link key={action.title} href={action.href} className="block h-full">
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -3, scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex flex-col items-center justify-center text-center p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-shadow cursor-pointer h-[135px]"
                            >
                                <div className={`rounded-full p-3 mb-3 ${action.bgClass} ${action.colorClass}`}>
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-foreground text-xs leading-none">
                                    {action.title}
                                </span>
                                <span className="text-[9px] text-muted-foreground mt-1 tracking-tight truncate w-full">
                                    {action.description}
                                </span>
                            </motion.div>
                        </Link>
                    ) : (
                        <motion.button
                            key={action.title}
                            variants={itemVariants}
                            whileHover={{ y: -3, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleActionClick(action.title)}
                            className="flex flex-col items-center justify-center text-center p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-shadow cursor-pointer w-full bg-transparent h-[135px]"
                        >
                            <div className={`rounded-full p-3 mb-3 ${action.bgClass} ${action.colorClass}`}>
                                <action.icon className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-foreground text-xs leading-none">
                                {action.title}
                            </span>
                            <span className="text-[9px] text-muted-foreground mt-1 tracking-tight truncate w-full">
                                {action.description}
                            </span>
                        </motion.button>
                    )
                ))}
            </motion.div>
        </section>
    );
}