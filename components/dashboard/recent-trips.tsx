"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Wallet, Users, Edit2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeleteTripButton } from "./delete-trip-button";

interface Trip {
    id: string;
    title: string;
    destination: string;
    description?: string | null;
    start_date: string;
    end_date: string;
    budget?: number | null;
    currency?: string;
    status: string;
    trip_members?: { profile_id: string }[];
    expenses?: { amount: number }[];
}

interface RecentTripsProps {
    trips: Trip[];
}

const GRADIENTS = [
    "from-[#6F8476] to-[#4F6456]", // Sage/Forest Green
    "from-[#79826D] to-[#59624D]", // Muted Olive
    "from-[#8A9A9A] to-[#6A7A7A]", // Blue Gray
    "from-[#6F7F80] to-[#4F5F60]", // Dusty Slate
    "from-[#5A6E5A] to-[#3A4E3A]", // Soft Forest
    "from-[#B89A63] to-[#987A43]", // Warm Gold/Bronze
];

function getCoverGradient(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    planning: {
        bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        text: "text-amber-500",
        label: "Planning",
    },
    upcoming: {
        bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        text: "text-emerald-500",
        label: "Upcoming",
    },
    completed: {
        bg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        text: "text-slate-500",
        label: "Completed",
    },
};

function formatAmount(amount: number, currency: string | undefined) {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency || "INR"} ${amount}`;
    }
}

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export function RecentTrips({ trips }: RecentTripsProps) {
    const router = useRouter();
    const hasTrips = trips && trips.length > 0;

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: "spring" as const, stiffness: 300, damping: 25 }
        },
    };

    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
            {/* Section Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
                        My Trips
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Continue planning your latest adventures.
                    </p>
                </div>
            </div>

            {/* Trip List / Empty State */}
            {!hasTrips ? (
                <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-border rounded-xl bg-gradient-to-b from-muted/5 to-muted/20 flex-1 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative mb-5">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                        <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 border border-primary/20 text-primary shadow-sm">
                            <MapPin className="h-8 w-8" />
                        </div>
                    </div>
                    <h3 className="font-extrabold text-xl text-foreground mb-2 tracking-tight">
                        No trips planned yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
                        Ready for your next adventure? Create a new trip timeline, set a budget, and start planning with your friends.
                    </p>
                    <Link
                        href="/dashboard/trips/new"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
                    >
                        <Plus className="h-4 w-4" />
                        Create a Trip
                    </Link>
                </div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6 sm:grid-cols-2 max-h-[560px] overflow-y-auto pr-1"
                >
                    {trips.map((trip) => {
                        const statusInfo = statusStyles[trip.status] || {
                            bg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
                            text: "text-slate-500",
                            label: trip.status,
                        };
                        const totalExpense = trip.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
                        const membersCount = trip.trip_members?.length || 1;
                        const gradient = getCoverGradient(trip.id);

                        return (
                            <motion.div
                                key={trip.id}
                                variants={cardVariants}
                                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        router.push(`/dashboard/trips/${trip.id}`);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/45 select-none"
                            >
                                {/* Cover Banner */}
                                <div className={`h-32 w-full bg-gradient-to-r ${gradient} relative flex items-end p-4 shrink-0`}>
                                    <div className="absolute inset-0 bg-black/10" />
                                    <span className={`absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase border bg-white/95 text-foreground shadow-sm ${statusInfo.text}`}>
                                        {statusInfo.label}
                                    </span>
                                    <h3 className="font-sans font-bold text-white text-2xl tracking-tight truncate drop-shadow-sm relative z-10">
                                        {trip.title}
                                    </h3>
                                </div>

                                {/* Content Details */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                                            <span className="truncate font-medium">{trip.destination}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
                                            <span className="font-medium">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-border/60 text-sm">
                                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                <Wallet className="h-4 w-4 text-primary/70 shrink-0" />
                                                <span>{formatAmount(totalExpense, trip.currency)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                <Users className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                <span>{membersCount} {membersCount === 1 ? "Member" : "Members"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2 shrink-0">
                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <Link
                                                href={`/dashboard/trips/${trip.id}`}
                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition text-xs font-semibold select-none"
                                            >
                                                Open
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                            <Link
                                                href={`/dashboard/trips/${trip.id}/edit`}
                                                className="inline-flex items-center justify-center p-1.5 border border-border rounded-lg hover:border-primary/30 hover:bg-muted/40 transition text-muted-foreground hover:text-foreground select-none"
                                                title="Edit Details"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                        
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DeleteTripButton tripId={trip.id} tripTitle={trip.title} isIconButton={true} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </section>
    );
}