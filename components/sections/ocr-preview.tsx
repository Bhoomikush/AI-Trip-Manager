import { ScanLine, Zap, Brain, ShieldCheck } from "lucide-react";
import { FileImage } from "lucide-react";

const EXTRACTED_FIELDS = [
    { label: "Merchant", value: "Thalassa Restaurant" },
    { label: "Amount", value: "₹4,250" },
    { label: "Date", value: "12 Aug 2026" },
    { label: "Category", value: "Food" },
];
const BENEFITS = [
    {
        icon: ScanLine,
        title: "Instant Receipt Scan",
        description: "Snap a photo and Tripzy reads it in seconds.",
    },
    {
        icon: Zap,
        title: "Automatic Expense Entry",
        description: "No typing — scanned receipts become expenses instantly.",
    },
    {
        icon: Brain,
        title: "Smart Data Extraction",
        description: "Merchant, amount, date, and category, all detected.",
    },
    {
        icon: ShieldCheck,
        title: "Error-Free Tracking",
        description: "Review before it's added — no accidental mistakes.",
    },
];

export function OCRPreview() {
    return (
        <section className="px-6 py-24">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                    <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Scan receipts. Forget manual entry.
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Upload any restaurant, hotel, fuel, or shopping receipt. Tripzy
                        automatically extracts the amount, date, and merchant, and adds
                        it to your shared trip expenses.
                    </p>

                    <div className="mt-8 space-y-5">
                        {BENEFITS.map((benefit) => (
                            <div key={benefit.title} className="flex gap-3">
                                <benefit.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {benefit.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card shadow-sm">
                    {/* Receipt header */}
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                <FileImage className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    receipt_thalassa.jpg
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Uploaded just now
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            98% Accuracy
                        </span>
                    </div>

                    {/* Extracted fields */}
                    <div className="border-b border-border px-5 py-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Recognized Information
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                            {EXTRACTED_FIELDS.map((field) => (
                                <div key={field.label}>
                                    <p className="text-xs text-muted-foreground">
                                        {field.label}
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        {field.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status + trip info */}
                    <div className="border-b border-border px-5 py-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Paid by</span>
                            <span className="font-medium text-foreground">Bhoomi</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Trip</span>
                            <span className="font-medium text-foreground">
                                Goa Friends Trip
                            </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                ✓ OCR Complete
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                ✓ Expense Ready
                            </span>
                        </div>
                    </div>

                    {/* Add to expenses */}
                    <div className="px-5 py-4">
                        <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                            Add to Trip Expenses
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}