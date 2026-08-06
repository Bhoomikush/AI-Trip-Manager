import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your account settings and profile information.</p>
            </div>

            <div className="flex justify-start">
                <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-border bg-card shadow-sm p-1">
                    <UserProfile 
                        routing="hash"
                        appearance={{
                            elements: {
                                cardBox: "shadow-none border-none w-full max-w-none",
                                card: "shadow-none border-none w-full max-w-none bg-transparent",
                                navbar: "bg-transparent border-r border-border/60",
                                pageScrollBox: "bg-transparent",
                                rootBox: "w-full max-w-none"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
