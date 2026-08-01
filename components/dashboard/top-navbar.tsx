"use client";

import { Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function TopNavbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
            {/* Left */}
            <div>
                <h1 className="text-xl font-semibold text-foreground">
                    Dashboard
                </h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 md:flex">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                {/* Notification */}
                <button className="rounded-lg p-2 transition hover:bg-muted">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                </button>

                {/* User */}
                <UserButton />            </div>
        </header>
    );
}