"use client";

import { Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function TopNavbar() {
    const pathname = usePathname();
    
    // Resolve page title based on path
    const getPageTitle = () => {
        if (pathname.startsWith("/dashboard/trips/")) {
            return "Trip Settings";
        }
        if (pathname === "/dashboard/trips/new") {
            return "Plan a New Trip";
        }
        return "Dashboard";
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-border/80 bg-background px-6 shrink-0">
            {/* Left */}
            <div>
                <h1 className="text-xl font-heading font-extrabold text-foreground tracking-tight">
                    {getPageTitle()}
                </h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden items-center gap-2 rounded-full border border-border bg-card/45 px-3.5 py-1.5 md:flex">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground text-foreground"
                    />
                </div>

                {/* Notification */}
                <button className="rounded-full p-2 hover:bg-card transition-colors">
                    <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                </button>

                {/* User */}
                <div className="flex items-center">
                    <UserButton appearance={{
                        elements: {
                            avatarBox: "h-8 w-8 rounded-full border border-border"
                        }
                    }} />
                </div>
            </div>
        </header>
    );
}