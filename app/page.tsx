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

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <AIPreview />
      <Collaboration />
      <ExpensePreview />
      <OCRPreview />
      <MapsPreview />
      <DashboardPreview />
    </main>
  );
}