"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Map,
    Receipt,
    Route,
    Settings,
    Wallet,
} from "lucide-react";

const MENU_ITEMS = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "My Trips",
        href: "#",
        icon: Route,
    },
    {
        name: "Expenses",
        href: "#",
        icon: Wallet,
    },
    {
        name: "Receipts",
        href: "#",
        icon: Receipt,
    },
    {
        name: "Maps",
        href: "#",
        icon: Map,
    },
    {
        name: "Settings",
        href: "#",
        icon: Settings,
    },
];

export function Sidebar() {
    return (
        <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
            <div className="border-b border-border p-6">
                <h1 className="text-2xl font-bold text-primary">
                    Tripzy
                </h1>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                {MENU_ITEMS.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}