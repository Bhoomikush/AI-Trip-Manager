import { Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

const QUICK_LINKS = [
    { label: "Home", href: "#" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "GitHub", href: "#" },
];

const RESOURCES = [
    { label: "Documentation", href: "#" },
    { label: "Roadmap", href: "#" },
    { label: "Contact", href: "#" },
];

const SOCIALS = [
    { icon: FaGithub, href: "#", label: "GitHub" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
    return (
        <footer id="faq" className="border-t border-border/80 bg-secondary/35 px-6 py-16">
            <div className="mx-auto max-w-6xl">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Brand */}
                    <div className="space-y-3">
                        <p className="text-xl font-heading font-extrabold text-foreground">
                            Tripzy
                        </p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[200px]">
                            Plan smarter. Travel together. Earthy aesthetic planning.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Quick Links
                        </p>
                        <ul className="mt-4 space-y-3">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Resources
                        </p>
                        <ul className="mt-4 space-y-3">
                            {RESOURCES.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Icons */}
                    <div>
                        <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Connect
                        </p>
                        <div className="mt-4 flex gap-2.5">
                            {SOCIALS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="mt-12 border-t border-border/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-medium text-muted-foreground">
                    <p>© 2026 Tripzy. All rights reserved.</p>
                    <p>Designed for premium modern explorers.</p>
                </div>
            </div>
        </footer>
    );
}