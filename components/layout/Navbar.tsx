"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/95 backdrop-blur-md border-b border-border/80 shadow-sm"
        : "bg-transparent"
        }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-xl text-foreground hover:opacity-90 transition">
          <Plane className="h-5 w-5 text-primary" />
          Tripzy
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-muted-foreground hover:text-accent transition-colors tracking-wider uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link href="/dashboard" passHref>
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-sm hover:shadow transition-all text-xs tracking-wider uppercase select-none">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="hover:bg-muted/40">
                  <Menu className="h-6 w-6 text-foreground" />
                </Button>
              }
            />

            <SheetContent side="right" className="w-[280px] bg-background border-l border-border">
              <div className="flex flex-col gap-6 mt-10">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-bold text-foreground hover:text-accent transition-colors tracking-wide"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/dashboard" passHref>
                  <Button onClick={() => setIsOpen(false)} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full text-xs tracking-wider uppercase">
                    Get Started
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}