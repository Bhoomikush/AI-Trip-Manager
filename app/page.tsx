import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { Features } from "@/components/sections/features";
import { AIPreview } from "@/components/sections/ai-preview";
import { Collaboration } from "@/components/sections/collaboration";
import { ExpensePreview } from "@/components/sections/expense-preview";
import { OCRPreview } from "@/components/sections/ocr-preview";
import { MapsPreview } from "@/components/sections/maps-preview";
import { DashboardPreview } from "@/components/sections/dashboard-preview";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="bg-background min-h-screen selection:bg-primary/20">
      <Navbar />
      <div className="space-y-20 md:space-y-32">
        <Hero />
        <Problem />
        <Features />
        <AIPreview />
        <Collaboration />
        <ExpensePreview />
        <OCRPreview />
        <MapsPreview />
        <DashboardPreview />
      </div>
      <div className="mt-20 md:mt-32">
        <Footer />
      </div>
    </main>
  );
}