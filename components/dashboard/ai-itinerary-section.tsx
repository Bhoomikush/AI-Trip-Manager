"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Calendar, Clock, Check, Edit2, Trash2, Plus, ArrowUp, ArrowDown, GripVertical, X, Save } from "lucide-react";
import { TripItinerary, TripActivity } from "@/types/ai";
import { getSavedItineraryAction, saveItineraryAction, deleteItineraryAction, verifyItineraryOwnerAction } from "@/lib/itinerary-actions";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";

interface AIItinerarySectionProps {
    trip: {
        id: string;
        destination: string;
        start_date: string;
        end_date: string;
        currency?: string;
    };
}

const INTERESTS_OPTIONS = [
    "Nature",
    "Food",
    "History",
    "Adventure",
    "Shopping",
    "Nightlife",
    "Photography",
    "Spiritual",
    "Museums",
];

const BUDGET_OPTIONS: Array<"Low" | "Medium" | "High"> = ["Low", "Medium", "High"];
const TRAVEL_STYLE_OPTIONS: Array<"Relaxed" | "Balanced" | "Packed"> = ["Relaxed", "Balanced", "Packed"];

export function AIItinerarySection({ trip }: AIItinerarySectionProps) {
    const { showToast } = useToast();
    const [budget, setBudget] = useState<"Low" | "Medium" | "High">("Medium");
    const [travelStyle, setTravelStyle] = useState<"Relaxed" | "Balanced" | "Packed">("Balanced");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [itinerary, setItinerary] = useState<TripItinerary | null>(null);

    // Save states
    const [isSaved, setIsSaved] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "failed">("idle");
    const [isOwner, setIsOwner] = useState(false);

    // States for inline editing
    const [editingActivity, setEditingActivity] = useState<{
        dayIndex: number;
        activityIndex: number;
        data: TripActivity;
    } | null>(null);

    // States for inline adding
    const [addingActivityDayIndex, setAddingActivityDayIndex] = useState<number | null>(null);
    const [newActivity, setNewActivity] = useState<TripActivity>({
        time: "",
        title: "",
        description: "",
        duration: "",
        estimatedCost: 0,
    });

    // Tracks which day number is currently regenerating
    const [regeneratingDays, setRegeneratingDays] = useState<Record<number, boolean>>({});

    // Load saved itinerary on mount
    useEffect(() => {
        async function loadItinerary() {
            setLoading(true);
            try {
                const saved = await getSavedItineraryAction(trip.id);
                if (saved) {
                    setItinerary(saved);
                    setIsSaved(true);
                }
                const ownerCheck = await verifyItineraryOwnerAction(trip.id);
                setIsOwner(ownerCheck);
            } catch (err) {
                console.error("Failed to load saved itinerary:", err);
            } finally {
                setLoading(false);
            }
        }
        loadItinerary();
    }, [trip.id]);

    // Warn about unsaved edits before page reload/navigate away
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "You have unsaved itinerary edits. Are you sure you want to leave?";
                return e.returnValue;
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isDirty]);

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter((i) => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        setItinerary(null);
        setSaveStatus("idle");

        // Client-side validations
        if (!trip.destination || !trip.destination.trim()) {
            setError("Cannot generate itinerary: Trip destination is missing.");
            setLoading(false);
            return;
        }

        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        if (end < start) {
            setError("Cannot generate itinerary: End Date cannot be before Start Date.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/ai/generate-itinerary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tripId: trip.id,
                    destination: trip.destination,
                    start_date: trip.start_date,
                    end_date: trip.end_date,
                    budget,
                    travelStyle,
                    interests: selectedInterests,
                }),
            });

            const data = await res.json();

            if (data.success && data.itinerary) {
                setItinerary(data.itinerary);
                setIsDirty(true); // Generated itinerary starts as dirty/unsaved
                setIsSaved(false);
            } else {
                setError(data.error || "Unable to generate itinerary. Please try again.");
            }
        } catch (err: any) {
            console.error("Failed to generate itinerary:", err);
            setError("Unable to generate itinerary. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateDay = async (dayNumber: number, date: string, dayIndex: number) => {
        if (!itinerary) return;
        setRegeneratingDays((prev) => ({ ...prev, [dayNumber]: true }));
        setError(null);
        setSaveStatus("idle");

        try {
            const res = await fetch("/api/ai/generate-itinerary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tripId: trip.id,
                    destination: trip.destination,
                    start_date: trip.start_date,
                    end_date: trip.end_date,
                    budget,
                    travelStyle,
                    interests: selectedInterests,
                    dayNumber,
                    date,
                }),
            });

            const data = await res.json();

            if (data.success && data.dayData) {
                // Replace only this day's activities in state
                const updatedDays = [...itinerary.days];
                updatedDays[dayIndex] = {
                    ...updatedDays[dayIndex],
                    activities: data.dayData.activities,
                };
                setItinerary({
                    ...itinerary,
                    days: updatedDays,
                });
                setIsDirty(true);
            } else {
                setError(data.error || `Unable to regenerate Day ${dayNumber}.`);
            }
        } catch (err) {
            console.error("Failed to regenerate day:", err);
            setError(`Unable to regenerate Day ${dayNumber}.`);
        } finally {
            setRegeneratingDays((prev) => ({ ...prev, [dayNumber]: false }));
        }
    };

    // Save itinerary to database
    const handleSaveItinerary = async () => {
        if (!itinerary) return;
        setSaving(true);
        setSaveStatus("saving");
        setError(null);

        try {
            const res = await saveItineraryAction(trip.id, itinerary);
            if (res.success) {
                setSaveStatus("success");
                setIsDirty(false);
                setIsSaved(true);
            } else {
                setSaveStatus("failed");
                setError(res.error || "Failed to save itinerary.");
            }
        } catch (err) {
            console.error("Save itinerary error:", err);
            setSaveStatus("failed");
            setError("Failed to save itinerary.");
        } finally {
            setSaving(false);
        }
    };

    // Delete itinerary from database
    const handleDeleteItinerary = async () => {
        if (!window.confirm("Are you sure you want to completely delete this itinerary? This action cannot be undone.")) {
            return;
        }

        setSaving(true);
        setError(null);
        setSaveStatus("idle");

        try {
            const res = await deleteItineraryAction(trip.id);
            if (res.success) {
                setItinerary(null);
                setIsDirty(false);
                setIsSaved(false);
            } else {
                setError(res.error || "Failed to delete itinerary.");
            }
        } catch (err) {
            console.error("Delete itinerary error:", err);
            setError("Failed to delete itinerary.");
        } finally {
            setSaving(false);
        }
    };

    // Inline Actions: Save Edit
    const handleSaveEdit = (dayIndex: number, activityIndex: number) => {
        if (!itinerary || !editingActivity) return;

        const { time, title, estimatedCost } = editingActivity.data;
        if (!time || !time.trim()) {
            showToast("Time is required.", "error");
            return;
        }
        if (!title || !title.trim()) {
            showToast("Title is required.", "error");
            return;
        }
        if (estimatedCost < 0) {
            showToast("Estimated cost cannot be negative.", "error");
            return;
        }

        const updatedDays = [...itinerary.days];
        updatedDays[dayIndex].activities[activityIndex] = editingActivity.data;

        // Auto-sort activities chronologically by time
        updatedDays[dayIndex].activities.sort((a, b) => a.time.localeCompare(b.time));

        setItinerary({
            ...itinerary,
            days: updatedDays,
        });
        setEditingActivity(null);
        setIsDirty(true);
    };

    // Inline Actions: Delete
    const handleDeleteActivity = (dayIndex: number, activityIndex: number, title: string) => {
        if (!itinerary) return;

        if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
            const updatedDays = [...itinerary.days];
            updatedDays[dayIndex].activities.splice(activityIndex, 1);
            setItinerary({
                ...itinerary,
                days: updatedDays,
            });
            setIsDirty(true);
        }
    };

    // Inline Actions: Add New Activity
    const handleAddActivity = (dayIndex: number) => {
        if (!itinerary) return;

        const { time, title, estimatedCost } = newActivity;
        if (!time || !time.trim()) {
            showToast("Time is required.", "error");
            return;
        }
        if (!title || !title.trim()) {
            showToast("Title is required.", "error");
            return;
        }
        if (estimatedCost < 0) {
            showToast("Estimated cost cannot be negative.", "error");
            return;
        }

        const updatedDays = [...itinerary.days];
        updatedDays[dayIndex].activities.push(newActivity);

        // Auto-sort activities chronologically by time
        updatedDays[dayIndex].activities.sort((a, b) => a.time.localeCompare(b.time));

        setItinerary({
            ...itinerary,
            days: updatedDays,
        });

        // Reset add states
        setAddingActivityDayIndex(null);
        setNewActivity({
            time: "",
            title: "",
            description: "",
            duration: "",
            estimatedCost: 0,
        });
        setIsDirty(true);
    };

    // Reordering: Mobile controls
    const moveActivity = (dayIndex: number, activityIndex: number, direction: "up" | "down") => {
        if (!itinerary) return;

        const activities = [...itinerary.days[dayIndex].activities];
        const targetIndex = direction === "up" ? activityIndex - 1 : activityIndex + 1;

        if (targetIndex < 0 || targetIndex >= activities.length) return;

        // Swap
        const temp = activities[activityIndex];
        activities[activityIndex] = activities[targetIndex];
        activities[targetIndex] = temp;

        const updatedDays = [...itinerary.days];
        updatedDays[dayIndex].activities = activities;

        setItinerary({
            ...itinerary,
            days: updatedDays,
        });
        setIsDirty(true);
    };

    // Reordering: Drag & Drop Handlers
    const handleDragStart = (e: React.DragEvent, dayIndex: number, activityIndex: number) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ dayIndex, activityIndex }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetDayIndex: number, targetActivityIndex: number) => {
        e.preventDefault();
        if (!itinerary) return;

        try {
            const dataStr = e.dataTransfer.getData("text/plain");
            if (!dataStr) return;

            const { dayIndex: sourceDayIndex, activityIndex: sourceActivityIndex } = JSON.parse(dataStr);

            // Constraint: Reorder ONLY within the same day
            if (sourceDayIndex !== targetDayIndex) return;

            const activities = [...itinerary.days[targetDayIndex].activities];
            const [moved] = activities.splice(sourceActivityIndex, 1);
            activities.splice(targetActivityIndex, 0, moved);

            const updatedDays = [...itinerary.days];
            updatedDays[targetDayIndex].activities = activities;

            setItinerary({
                ...itinerary,
                days: updatedDays,
            });
            setIsDirty(true);
        } catch (err) {
            console.error("Drag and drop failed:", err);
        }
    };

    const formatCost = (cost: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: trip.currency || "INR",
            maximumFractionDigits: 0,
        }).format(cost);
    };

    return (
        <div id="ai-itinerary-planner" className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="bg-muted/30 border-b border-border p-6 flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Trip Planner
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Generate custom day-wise travel schedules powered by AI
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Form Controls */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Budget & Style */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Budget Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {BUDGET_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        disabled={loading || saving}
                                        onClick={() => setBudget(opt)}
                                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                                            budget === opt
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background text-foreground border-input hover:bg-muted/50"
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Travel Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {TRAVEL_STYLE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        disabled={loading || saving}
                                        onClick={() => setTravelStyle(opt)}
                                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                                            travelStyle === opt
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background text-foreground border-input hover:bg-muted/50"
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Interests select */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Interests</label>
                        <div className="flex flex-wrap gap-2">
                            {INTERESTS_OPTIONS.map((opt) => {
                                const selected = selectedInterests.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        disabled={loading || saving}
                                        onClick={() => toggleInterest(opt)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                                            selected
                                                ? "bg-primary/10 text-primary border-primary/30"
                                                : "bg-background text-muted-foreground border-input hover:bg-muted/50"
                                        }`}
                                    >
                                        {selected && <Check className="h-3 w-3" />}
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Generate Trigger */}
                <div className="pt-2 border-t border-border flex justify-end">
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={loading || saving}
                        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/95 px-6 py-2.5 rounded-lg transition font-semibold text-sm disabled:opacity-50 min-w-[180px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : isSaved ? (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Update Itinerary
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate AI Itinerary
                            </>
                        )}
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-destructive/15 border border-destructive/20 text-destructive text-sm p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Loading State Overlay */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-muted/10 rounded-xl border border-border/50">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="font-semibold text-foreground text-sm">
                            {isSaved ? "Loading your itinerary..." : "Generating your AI itinerary..."}
                        </p>
                        <p className="text-xs text-muted-foreground">Please wait a moment</p>
                    </div>
                )}

                {/* Itinerary Result Display */}
                {itinerary && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6 pt-4 border-t border-border"
                    >
                        {/* Summary Block */}
                        <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-2">
                            <h3 className="text-lg font-bold text-foreground">{itinerary.tripTitle}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{itinerary.summary}</p>
                        </div>

                        {/* Days Timeline */}
                        <div className="space-y-8">
                            {itinerary.days.map((day, dayIndex) => {
                                const isRegenerating = !!regeneratingDays[day.day];

                                return (
                                    <motion.div 
                                        key={day.day} 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: dayIndex * 0.05 }}
                                        className={`space-y-4 border border-border/60 p-5 rounded-xl bg-background/50 relative transition ${
                                            isRegenerating ? "opacity-60 pointer-events-none" : ""
                                        }`}
                                    >
                                        {/* Day Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/50 gap-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                                    {day.day}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground">Day {day.day}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(day.date).toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {isOwner && (
                                                <button
                                                    type="button"
                                                    disabled={isRegenerating || saving}
                                                    onClick={() => handleRegenerateDay(day.day, day.date, dayIndex)}
                                                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 border border-primary/20 hover:bg-primary/5 px-2.5 py-1 rounded-md disabled:opacity-50"
                                                >
                                                    {isRegenerating ? (
                                                        <>
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                            Regenerating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="h-3 w-3" />
                                                            Regenerate Day
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Day Loading Spinner overlay */}
                                        {isRegenerating && (
                                            <div className="absolute inset-0 bg-background/40 flex items-center justify-center rounded-xl">
                                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                            </div>
                                        )}

                                        {/* Activities Timeline */}
                                        <div className="space-y-4">
                                            {day.activities.map((act, activityIndex) => {
                                                const isEditing = editingActivity?.dayIndex === dayIndex && editingActivity?.activityIndex === activityIndex;

                                                return (
                                                    <motion.div
                                                        key={activityIndex}
                                                        layout
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        draggable={!isEditing && isOwner && !saving}
                                                        onDragStart={(e: any) => handleDragStart(e, dayIndex, activityIndex)}
                                                        onDragOver={(e: any) => handleDragOver(e)}
                                                        onDrop={(e: any) => handleDrop(e, dayIndex, activityIndex)}
                                                        className={`relative flex gap-3 p-3 rounded-lg border border-border bg-card/60 transition ${
                                                            isEditing ? "ring-2 ring-primary/20 border-primary" : "hover:shadow-sm"
                                                        }`}
                                                    >
                                                        {/* Drag Handle Icon for Desktop (Only for Owner) */}
                                                        {isOwner && (
                                                            <div className="hidden sm:flex items-center text-muted-foreground/40 cursor-grab active:cursor-grabbing px-1">
                                                                <GripVertical className="h-4 w-4" />
                                                            </div>
                                                        )}

                                                        {/* Activity Content Area */}
                                                        <div className="flex-1 space-y-2 min-w-0">
                                                            {isEditing ? (
                                                                /* Inline EDIT form */
                                                                <div className="space-y-3">
                                                                    <div className="grid gap-2 sm:grid-cols-3">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Time *</label>
                                                                            <input
                                                                                type="time"
                                                                                value={editingActivity.data.time}
                                                                                onChange={(e) => setEditingActivity({
                                                                                    ...editingActivity,
                                                                                    data: { ...editingActivity.data, time: e.target.value }
                                                                                })}
                                                                                className="w-full bg-background border border-input px-2.5 py-1 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1 sm:col-span-2">
                                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Title *</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editingActivity.data.title}
                                                                                onChange={(e) => setEditingActivity({
                                                                                    ...editingActivity,
                                                                                    data: { ...editingActivity.data, title: e.target.value }
                                                                                })}
                                                                                className="w-full bg-background border border-input px-2.5 py-1 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Duration</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editingActivity.data.duration}
                                                                                onChange={(e) => setEditingActivity({
                                                                                    ...editingActivity,
                                                                                    data: { ...editingActivity.data, duration: e.target.value }
                                                                                })}
                                                                                placeholder="e.g. 2 hours"
                                                                                className="w-full bg-background border border-input px-2.5 py-1 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Est. Cost</label>
                                                                            <input
                                                                                type="number"
                                                                                value={editingActivity.data.estimatedCost}
                                                                                onChange={(e) => setEditingActivity({
                                                                                    ...editingActivity,
                                                                                    data: { ...editingActivity.data, estimatedCost: parseInt(e.target.value) || 0 }
                                                                                })}
                                                                                className="w-full bg-background border border-input px-2.5 py-1 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Description</label>
                                                                        <textarea
                                                                            value={editingActivity.data.description}
                                                                            onChange={(e) => setEditingActivity({
                                                                                ...editingActivity,
                                                                                data: { ...editingActivity.data, description: e.target.value }
                                                                            })}
                                                                            className="w-full bg-background border border-input px-2.5 py-1.5 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-16 resize-none"
                                                                        />
                                                                    </div>

                                                                    <div className="flex gap-2 justify-end">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingActivity(null)}
                                                                            className="px-3 py-1.5 border border-border text-xs rounded-md text-muted-foreground hover:bg-muted"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleSaveEdit(dayIndex, activityIndex)}
                                                                            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md font-semibold hover:bg-primary/90"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                /* Display Mode */
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-start justify-between flex-wrap gap-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-muted rounded text-foreground flex items-center gap-1 font-mono">
                                                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                                                {act.time}
                                                                            </span>
                                                                            <h5 className="font-semibold text-foreground text-sm">
                                                                                {act.title}
                                                                            </h5>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                            {act.duration && <span>{act.duration}</span>}
                                                                            
                                                                            {/* Mobile reorder controls (Only for Owner) */}
                                                                            {isOwner && (
                                                                                <div className="flex sm:hidden items-center gap-0.5 border border-border rounded-md overflow-hidden bg-background">
                                                                                    <button
                                                                                        type="button"
                                                                                        disabled={activityIndex === 0 || saving}
                                                                                        onClick={() => moveActivity(dayIndex, activityIndex, "up")}
                                                                                        className="p-1 hover:bg-muted disabled:opacity-30"
                                                                                    >
                                                                                        <ArrowUp className="h-3 w-3" />
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        disabled={activityIndex === day.activities.length - 1 || saving}
                                                                                        onClick={() => moveActivity(dayIndex, activityIndex, "down")}
                                                                                        className="p-1 hover:bg-muted border-l border-border disabled:opacity-30"
                                                                                    >
                                                                                        <ArrowDown className="h-3 w-3" />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                                        {act.description}
                                                                    </p>

                                                                    {act.estimatedCost > 0 && (
                                                                        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                                            Est. Cost: {formatCost(act.estimatedCost)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons (Edit / Delete / Desktop Reorder) - Only for Owner */}
                                                        {isOwner && !isEditing && (
                                                            <div className="flex flex-col justify-between items-end gap-2 pl-2 border-l border-border/50">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        disabled={saving}
                                                                        onClick={() => setEditingActivity({
                                                                            dayIndex,
                                                                            activityIndex,
                                                                            data: { ...act }
                                                                        })}
                                                                        className="p-1 text-muted-foreground hover:text-primary transition rounded hover:bg-muted disabled:opacity-50"
                                                                        title="Edit activity"
                                                                    >
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={saving}
                                                                        onClick={() => handleDeleteActivity(dayIndex, activityIndex, act.title)}
                                                                        className="p-1 text-muted-foreground hover:text-destructive transition rounded hover:bg-muted disabled:opacity-50"
                                                                        title="Delete activity"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>

                                                                {/* Desktop Reorder triggers */}
                                                                <div className="hidden sm:flex items-center gap-0.5 border border-border rounded-md bg-background overflow-hidden">
                                                                    <button
                                                                        type="button"
                                                                        disabled={activityIndex === 0 || saving}
                                                                        onClick={() => moveActivity(dayIndex, activityIndex, "up")}
                                                                        className="p-1 hover:bg-muted disabled:opacity-30"
                                                                        title="Move up"
                                                                    >
                                                                        <ArrowUp className="h-3 w-3" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={activityIndex === day.activities.length - 1 || saving}
                                                                        onClick={() => moveActivity(dayIndex, activityIndex, "down")}
                                                                        className="p-1 hover:bg-muted border-l border-border disabled:opacity-30"
                                                                        title="Move down"
                                                                    >
                                                                        <ArrowDown className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}

                                            {/* ADD inline activity form */}
                                            {isOwner && (addingActivityDayIndex === dayIndex ? (
                                                <div className="border border-dashed border-primary/30 p-4 rounded-lg bg-primary/5 space-y-3">
                                                    <h5 className="text-xs font-bold text-primary flex items-center gap-1">
                                                        <Plus className="h-3 w-3" /> Add Activity for Day {day.day}
                                                    </h5>

                                                    <div className="grid gap-2 sm:grid-cols-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Time *</label>
                                                            <input
                                                                type="time"
                                                                value={newActivity.time}
                                                                onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                                                className="w-full bg-background border border-input px-2.5 py-1 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                            />
                                                        </div>
                                                        <div className="space-y-1 sm:col-span-2">
                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Title *</label>
                                                            <input
                                                                type="text"
                                                                value={newActivity.title}
                                                                placeholder="Activity title..."
                                                                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                                                className="w-full bg-background border border-input px-2.5 py-1 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Duration</label>
                                                            <input
                                                                type="text"
                                                                value={newActivity.duration}
                                                                placeholder="e.g. 1.5 hours"
                                                                onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                                                                className="w-full bg-background border border-input px-2.5 py-1 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Est. Cost</label>
                                                            <input
                                                                type="number"
                                                                value={newActivity.estimatedCost}
                                                                onChange={(e) => setNewActivity({ ...newActivity, estimatedCost: parseInt(e.target.value) || 0 })}
                                                                className="w-full bg-background border border-input px-2.5 py-1 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Description</label>
                                                        <textarea
                                                            value={newActivity.description}
                                                            placeholder="Brief description..."
                                                            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                                            className="w-full bg-background border border-input px-2.5 py-1.5 text-xs rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-16 resize-none"
                                                        />
                                                    </div>

                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => setAddingActivityDayIndex(null)}
                                                            className="px-3 py-1.5 border border-border text-xs rounded-md text-muted-foreground hover:bg-muted flex items-center gap-1"
                                                        >
                                                            <X className="h-3 w-3" /> Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddActivity(dayIndex)}
                                                            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md font-semibold hover:bg-primary/90 flex items-center gap-1"
                                                        >
                                                            <Check className="h-3 w-3" /> Add Activity
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={saving}
                                                    onClick={() => setAddingActivityDayIndex(dayIndex)}
                                                    className="w-full py-2.5 border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <Plus className="h-4 w-4" /> Add Activity
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Save / Update & Delete Actions (For Owner Only) */}
                        {isOwner && (
                            <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    {saveStatus === "saving" && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Saving Itinerary...
                                        </span>
                                    )}
                                    {saveStatus === "success" && (
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                            <Check className="h-3.5 w-3.5" /> Saved successfully
                                        </span>
                                    )}
                                    {saveStatus === "failed" && (
                                        <span className="text-xs text-destructive font-semibold flex items-center gap-1.5 bg-destructive/10 px-2.5 py-1 rounded-md border border-destructive/20">
                                            <X className="h-3.5 w-3.5" /> Save failed
                                        </span>
                                    )}
                                    {isDirty && saveStatus !== "saving" && (
                                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 animate-pulse">
                                            ⚠️ Unsaved changes
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {isSaved && (
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={handleDeleteItinerary}
                                            className="px-4 py-2 border border-destructive/30 hover:bg-destructive/5 text-destructive rounded-lg text-sm font-semibold transition disabled:opacity-50"
                                        >
                                            Delete Itinerary
                                        </button>
                                    )}
                                    
                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={handleSaveItinerary}
                                        className="flex items-center gap-1.5 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-sm"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSaved ? "Save Itinerary" : "Save Itinerary"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
