import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-24">
            <SignUp
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