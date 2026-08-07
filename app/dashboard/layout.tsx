import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    await auth.protect();

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                <TopNavbar />

                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}