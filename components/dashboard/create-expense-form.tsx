"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "@/lib/expenses";
import { uploadReceiptAction, deleteReceiptAction } from "@/lib/storage-actions";
import { Upload, X, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface CreateExpenseFormProps {
    tripId: string;
}

const CATEGORIES = [
    "Food",
    "Travel",
    "Accommodation",
    "Shopping",
    "Entertainment",
    "Transport",
    "Other",
];

const CURRENCIES = [
    { code: "INR", label: "INR (₹)" },
    { code: "USD", label: "USD ($)" },
    { code: "EUR", label: "EUR (€)" },
    { code: "GBP", label: "GBP (£)" },
];

export function CreateExpenseForm({ tripId }: CreateExpenseFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    // Controlled input states
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [category, setCategory] = useState("");
    const [expenseDate, setExpenseDate] = useState("");

    // States for receipt upload & scanning
    const [expenseId, setExpenseId] = useState<string>("");
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const [receiptPath, setReceiptPath] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // AI summary card and validation states
    const [aiExtractedData, setAiExtractedData] = useState<{
        merchant: string | null;
        amount: number;
        currency: string;
        date: string;
        category: string;
        confidence: number;
    } | null>(null);
    const [aiFailed, setAiFailed] = useState(false);
    const [aiFilledFields, setAiFilledFields] = useState({
        title: false,
        amount: false,
        currency: false,
        category: false,
        expenseDate: false,
    });

    // Initialize state on client mount to avoid SSR mismatch
    useEffect(() => {
        setExpenseId(crypto.randomUUID());
        setExpenseDate(new Date().toISOString().split("T")[0]);
    }, []);

    // Drag and Drop Handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        setError(null);
        setWarning(null);
        setAiFailed(false);

        // 1. Validate File Type
        const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
        const ext = file.name.split(".").pop()?.toLowerCase() || "";

        if (!allowedMimeTypes.includes(file.type.toLowerCase()) && !allowedExtensions.includes(ext)) {
            setError("Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.");
            return;
        }

        // 2. Validate File Size (10 MB limit)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setError("File size exceeds the 10 MB limit.");
            return;
        }

        setUploading(true);

        let uploadedUrl = "";
        try {
            // Delete previous receipt if user is replacing it
            if (receiptPath) {
                await deleteReceiptAction(receiptPath);
                setReceiptUrl(null);
                setReceiptPath(null);
                handleClearSuggestions();
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("tripId", tripId);
            formData.append("expenseId", expenseId);

            const result = await uploadReceiptAction(formData);
            setReceiptUrl(result.publicUrl);
            setReceiptPath(result.path);
            uploadedUrl = result.publicUrl;
        } catch (err: any) {
            setError(err.message || "Failed to upload receipt image.");
            setUploading(false);
            return;
        }

        setUploading(false);

        // Trigger AI receipt analysis immediately after upload finishes
        if (uploadedUrl) {
            await scanReceipt(uploadedUrl);
        }
    };

    const scanReceipt = async (url: string) => {
        setAnalyzing(true);
        setError(null);
        setWarning(null);
        setAiFailed(false);

        try {
            const response = await fetch("/api/ai/scan-receipt", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ receiptUrl: url }),
            });

            const result = await response.json();

            if (result.success && result.data) {
                const { merchant, amount: extAmount, currency: extCurrency, date: extDate, category: extCategory, confidence } = result.data;

                // Set extracted data card details
                setAiExtractedData(result.data);

                // Auto-populate fields if extracted values exist
                if (merchant) setTitle(merchant);
                if (extAmount) setAmount(String(extAmount));
                if (extCurrency) setCurrency(extCurrency);
                if (extCategory) setCategory(extCategory);
                if (extDate) setExpenseDate(extDate);

                // Highlight populated fields
                setAiFilledFields({
                    title: !!merchant,
                    amount: !!extAmount,
                    currency: !!extCurrency,
                    category: !!extCategory,
                    expenseDate: !!extDate,
                });

                // Show warning banner if AI confidence is low (< 0.70)
                if (confidence < 0.70) {
                    setWarning("AI is not confident about this receipt. Please verify the extracted information before saving.");
                }
            } else {
                throw new Error(result.error || "Unable to read receipt");
            }
        } catch (err: any) {
            console.error("AI scanning error:", err);
            setAiFailed(true);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleClearSuggestions = () => {
        setTitle("");
        setAmount("");
        setCurrency("INR");
        setCategory("");
        setExpenseDate(new Date().toISOString().split("T")[0]);
        setAiExtractedData(null);
        setAiFailed(false);
        setWarning(null);
        setAiFilledFields({
            title: false,
            amount: false,
            currency: false,
            category: false,
            expenseDate: false,
        });
    };

    const handleRemoveReceipt = async () => {
        if (!receiptPath) return;
        setUploading(true);
        setError(null);
        setWarning(null);
        try {
            await deleteReceiptAction(receiptPath);
            setReceiptUrl(null);
            setReceiptPath(null);
            handleClearSuggestions();
        } catch (err: any) {
            setError(err.message || "Failed to delete receipt from storage.");
        } finally {
            setUploading(false);
        }
    };

    const getConfidenceClass = (confidence: number) => {
        if (confidence >= 0.90) {
            return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20";
        }
        if (confidence >= 0.70) {
            return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
        }
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!title || !title.trim()) {
            setError("Title is required.");
            setLoading(false);
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError("Amount must be a positive number greater than 0.");
            setLoading(false);
            return;
        }

        if (!currency || currency.length !== 3) {
            setError("Please select a valid currency.");
            setLoading(false);
            return;
        }

        if (!category) {
            setError("Please select a category.");
            setLoading(false);
            return;
        }

        if (!expenseDate) {
            setError("Expense date is required.");
            setLoading(false);
            return;
        }

        try {
            await createExpense({
                id: expenseId || undefined,
                tripId,
                title,
                amount: numericAmount,
                currency,
                category,
                expenseDate,
                receiptUrl: receiptUrl || undefined,
            });
            router.push(`/dashboard/trips/${tripId}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl bg-card border border-border p-6 rounded-xl shadow-sm">
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {warning && (
                <div className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-sm p-4 rounded-lg border border-amber-500/20 flex gap-2 items-start">
                    <span className="text-base leading-none">⚠️</span>
                    <div>
                        <p className="font-semibold">AI is not confident about this receipt.</p>
                        <p className="text-xs mt-0.5 opacity-90">Please verify the extracted information before saving.</p>
                    </div>
                </div>
            )}

            {aiFailed && (
                <div className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-sm p-4 rounded-lg border border-amber-500/20">
                    <p className="font-medium">We couldn't read this receipt.</p>
                    <p className="text-xs mt-0.5 opacity-90">You can still enter the expense manually.</p>
                </div>
            )}

            {/* AI Extracted Receipt Summary Card */}
            {aiExtractedData && (
                <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center gap-2">
                        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                            <Sparkles className="h-4 w-4 text-primary" /> AI Extracted Receipt
                        </h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getConfidenceClass(aiExtractedData.confidence)}`}>
                            AI Confidence: {Math.round(aiExtractedData.confidence * 100)}%
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/50">
                        <div><span className="font-medium text-foreground">Merchant:</span> {aiExtractedData.merchant || "N/A"}</div>
                        <div><span className="font-medium text-foreground">Amount:</span> {aiExtractedData.currency} {aiExtractedData.amount}</div>
                        <div><span className="font-medium text-foreground">Category:</span> {aiExtractedData.category}</div>
                        <div><span className="font-medium text-foreground">Date:</span> {aiExtractedData.date}</div>
                    </div>

                    <div className="flex justify-end pt-1">
                        <button
                            type="button"
                            onClick={handleClearSuggestions}
                            className="text-xs font-semibold text-destructive hover:underline"
                        >
                            Clear AI Suggestions
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label htmlFor="title" className="text-sm font-medium text-foreground">Expense Title *</label>
                    {aiFilledFields.title && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                            <Sparkles className="h-3 w-3" /> AI Extracted
                        </span>
                    )}
                </div>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setAiFilledFields((prev) => ({ ...prev, title: false }));
                    }}
                    placeholder="e.g. Dinner at the beach"
                    className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 ${
                        aiFilledFields.title 
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                            : "border-input"
                    }`}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="amount" className="text-sm font-medium text-foreground">Amount *</label>
                        {aiFilledFields.amount && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                                <Sparkles className="h-3 w-3" /> AI Extracted
                            </span>
                        )}
                    </div>
                    <input
                        id="amount"
                        name="amount"
                        type="number"
                        step="any"
                        required
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setAiFilledFields((prev) => ({ ...prev, amount: false }));
                        }}
                        placeholder="0.00"
                        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 ${
                            aiFilledFields.amount 
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                : "border-input"
                        }`}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="currency" className="text-sm font-medium text-foreground">Currency *</label>
                        {aiFilledFields.currency && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                                <Sparkles className="h-3 w-3" /> AI Extracted
                            </span>
                        )}
                    </div>
                    <select
                        id="currency"
                        name="currency"
                        value={currency}
                        onChange={(e) => {
                            setCurrency(e.target.value);
                            setAiFilledFields((prev) => ({ ...prev, currency: false }));
                        }}
                        required
                        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 ${
                            aiFilledFields.currency 
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                : "border-input"
                        }`}
                    >
                        {CURRENCIES.map((cur) => (
                            <option key={cur.code} value={cur.code}>
                                {cur.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="category" className="text-sm font-medium text-foreground">Category *</label>
                        {aiFilledFields.category && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                                <Sparkles className="h-3 w-3" /> AI Extracted
                            </span>
                        )}
                    </div>
                    <select
                        id="category"
                        name="category"
                        required
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setAiFilledFields((prev) => ({ ...prev, category: false }));
                        }}
                        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 ${
                            aiFilledFields.category 
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                : "border-input"
                        }`}
                    >
                        <option value="" disabled>Select a category</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="expense_date" className="text-sm font-medium text-foreground">Expense Date *</label>
                        {aiFilledFields.expenseDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                                <Sparkles className="h-3 w-3" /> AI Extracted
                            </span>
                        )}
                    </div>
                    <input
                        id="expense_date"
                        name="expense_date"
                        type="date"
                        required
                        value={expenseDate}
                        onChange={(e) => {
                            setExpenseDate(e.target.value);
                            setAiFilledFields((prev) => ({ ...prev, expenseDate: false }));
                        }}
                        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 ${
                            aiFilledFields.expenseDate 
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                : "border-input"
                        }`}
                    />
                </div>
            </div>

            {/* Receipt Section */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Receipt Image (Optional)</label>
                
                {receiptUrl ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/40"
                    >
                        <div className="relative h-20 w-20 rounded-md overflow-hidden border border-border bg-background flex items-center justify-center">
                            <img 
                                src={receiptUrl} 
                                alt="Receipt Preview" 
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                                {!analyzing && (
                                    <motion.span 
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1 }} 
                                        className="text-emerald-500 font-bold"
                                    >
                                        ✓
                                    </motion.span>
                                )}
                                {analyzing ? "Analyzing receipt..." : "Receipt analyzed successfully!"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {analyzing ? "Gemini is extracting details" : "Stored securely in Supabase"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveReceipt}
                            disabled={uploading || analyzing}
                            className="p-2 text-muted-foreground hover:text-destructive transition rounded-lg hover:bg-muted disabled:opacity-50"
                            aria-label="Remove receipt"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </motion.div>
                ) : (
                    <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition text-center cursor-pointer ${
                            dragActive 
                                ? "border-primary bg-primary/5" 
                                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
                        } ${uploading || analyzing ? "pointer-events-none opacity-60" : ""}`}
                    >
                        <input
                            id="receipt-file-input"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handleFileChange}
                            disabled={uploading || analyzing}
                            className="hidden"
                        />
                        
                        {uploading || analyzing ? (
                            <div className="flex flex-col items-center space-y-2">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <p className="text-sm font-medium text-foreground">
                                    {analyzing ? "Analyzing receipt..." : "Uploading receipt..."}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {analyzing ? "Gemini is extracting details" : "Please wait while the image is secured"}
                                </p>
                            </div>
                        ) : (
                            <label htmlFor="receipt-file-input" className="cursor-pointer flex flex-col items-center space-y-2 w-full h-full py-4">
                                <Upload className="h-8 w-8 text-muted-foreground mb-1" />
                                <p className="text-sm font-medium text-foreground">
                                    <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    JPG, JPEG, PNG, or WEBP (Max 10 MB)
                                </p>
                            </label>
                        )}
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.push(`/dashboard/trips/${tripId}`)}
                    className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || uploading || analyzing}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {(loading || analyzing) && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Adding..." : analyzing ? "Analyzing..." : "Add Expense"}
                </button>
            </div>
        </form>
    );
}
