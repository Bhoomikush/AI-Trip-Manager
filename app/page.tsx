import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
    </main>
  );
}