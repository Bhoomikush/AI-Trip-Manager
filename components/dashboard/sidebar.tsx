"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
        href: "/dashboard/trips",
        icon: Route,
    },
    {
        name: "Expenses",
        href: "/dashboard/expenses",
        icon: Wallet,
    },
    {
        name: "Receipts",
        href: "/dashboard/receipts",
        icon: Receipt,
    },
    {
        name: "Maps",
        href: "/dashboard/maps",
        icon: Map,
    },
    {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-border/80 bg-secondary/40 shrink-0">
            <div className="border-b border-border/80 px-6 py-5">
                <Link href="/dashboard" className="text-2xl font-heading font-extrabold text-primary hover:opacity-90 transition">
                    Tripzy
                </Link>
            </div>

            <nav className="flex-1 space-y-1.5 p-4">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold tracking-wide uppercase transition-all duration-200 select-none ${
                                isActive
                                    ? "bg-card text-foreground shadow-sm border border-border/60"
                                    : "text-muted-foreground hover:bg-card/45 hover:text-foreground"
                            }`}
                        >
                            <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}