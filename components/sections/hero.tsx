"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative px-6 pb-20 pt-40 md:pt-48 overflow-hidden bg-background">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-12 lg:grid-cols-12 items-center">
                    
                    {/* Left: Headline & CTAs */}
                    <div className="lg:col-span-6 space-y-8 text-left">
                        <div className="space-y-4">
                            <motion.span 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-xs font-bold tracking-widest uppercase text-accent bg-accent/10 px-3 py-1 rounded-full inline-block"
                            >
                                Introducing Tripzy AI
                            </motion.span>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                                className="text-balance text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tight text-foreground leading-[1.1]"
                            >
                                Plan group trips together, powered by AI
                            </motion.h1>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="max-w-2xl text-balance text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed"
                            >
                                One shared workspace instead of five scattered apps — itinerary,
                                expenses, and collaboration, all in one place.
                            </motion.p>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
                        >
                            <Link href="/dashboard" passHref className="block">
                                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-8 py-6 text-sm shadow-md hover:shadow-lg transition-all w-full sm:w-auto tracking-wider uppercase select-none">
                                    Start Planning
                                    <ArrowRight className="h-4.5 w-4.5" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="rounded-full border-border/80 text-foreground hover:bg-muted/40 font-semibold px-8 py-6 text-sm tracking-wider uppercase select-none">
                                <PlayCircle className="h-4.5 w-4.5" />
                                Watch Demo
                            </Button>
                        </motion.div>
                    </div>

                    {/* Right: Editorial Image Frame */}
                    <div className="lg:col-span-6 relative">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="relative aspect-square sm:aspect-video lg:aspect-square w-full rounded-3xl overflow-hidden border border-border bg-card p-2.5 shadow-md group hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="relative w-full h-full rounded-2xl overflow-hidden">
                                <img 
                                    src="/misty_alpine_forest.png" 
                                    alt="Misty pine forest surrounding a serene alpine lake at golden hour" 
                                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-103"
                                />
                                <div className="absolute inset-0 bg-black/10" />
                            </div>
                        </motion.div>
                        {/* Decorative background blur accents */}
                        <div className="absolute -left-12 -top-12 h-64 w-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
                        <div className="absolute -right-12 -bottom-12 h-64 w-64 bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />
                    </div>

                </div>
            </div>
        </section>
    );
}