import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { Features } from "@/components/sections/features";
import { AIPreview } from "@/components/sections/ai-preview";
import { Collaboration } from "@/components/sections/collaboration";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <AIPreview />
      <Collaboration />
    </main>
  );
}