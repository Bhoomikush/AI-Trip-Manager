"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => {
                        let bgColor = "bg-zinc-900 border-zinc-800 text-zinc-100";
                        let Icon = Info;
                        let iconColor = "text-blue-400";

                        if (toast.type === "success") {
                            bgColor = "bg-emerald-950/90 border-emerald-800/50 text-emerald-100";
                            Icon = CheckCircle;
                            iconColor = "text-emerald-400";
                        } else if (toast.type === "error") {
                            bgColor = "bg-rose-950/90 border-rose-800/50 text-rose-100";
                            Icon = AlertCircle;
                            iconColor = "text-rose-400";
                        }

                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                                className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto backdrop-blur-md ${bgColor}`}
                            >
                                <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
                                <div className="flex-1 text-xs font-medium leading-normal">
                                    {toast.message}
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="text-muted-foreground hover:text-foreground transition shrink-0 p-0.5 rounded"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
