"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Plane, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

interface Trip {
    id: string;
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
}

interface WelcomeHeroProps {
    userName: string;
    latestTrip?: Trip | null;
}

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export function WelcomeHero({ userName, latestTrip }: WelcomeHeroProps) {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-5 items-center relative z-10">
                {/* Left: Greeting & CTA */}
                <div className="md:col-span-3 space-y-6">
                    <div className="space-y-2">
                        <motion.h2 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-4xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight"
                        >
                            Welcome back, {userName || "Traveler"} 👋
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="text-lg md:text-xl text-muted-foreground font-medium"
                        >
                            Ready for your next adventure?
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-block"
                    >
                        <Link href="/dashboard/trips/new" passHref>
                            <span className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-primary hover:bg-[#2A4568] text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-primary/20 transition cursor-pointer select-none">
                                <Plus className="h-4.5 w-4.5" />
                                Start Planning
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </Link>
                    </motion.div>
                </div>

                {/* Right: Active Trip / CTA Sidebar */}
                <div className="md:col-span-2">
                    {latestTrip ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="bg-card/40 backdrop-blur-sm border border-border/80 rounded-xl p-5 space-y-4 hover:border-primary/30 transition-all hover:shadow-md"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                Current Active Trip
                            </span>
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground truncate text-base">
                                    {latestTrip.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="truncate">{latestTrip.destination}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span>{formatDate(latestTrip.start_date)} - {formatDate(latestTrip.end_date)}</span>
                                </div>
                            </div>
                            <Link 
                                href={`/dashboard/trips/${latestTrip.id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                                Open Trip details <ArrowRight className="h-3 w-3" />
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="border border-dashed border-border/80 rounded-xl p-5 text-center space-y-3 bg-muted/5"
                        >
                            <div className="mx-auto h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Plane className="h-4.5 w-4.5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground text-sm">Create your first trip</h4>
                                <p className="text-xs text-muted-foreground">
                                    Add a destination to get started.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
            {/* Background design accents */}
            <div className="absolute right-0 top-0 h-48 w-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </section>
    );
}
