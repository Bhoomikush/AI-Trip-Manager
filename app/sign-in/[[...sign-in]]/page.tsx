import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-24">
            <SignIn
                appearance={{
                    elements: {
                        card: "shadow-sm border border-border rounded-xl",
                        formButtonPrimary:
                            "bg-primary hover:bg-primary/90 text-primary-foreground",
                    },
                }}
            />
        </div>
    );
}