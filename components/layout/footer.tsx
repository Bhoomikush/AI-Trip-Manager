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
        <footer className="border-t border-border px-6 py-12">
            <div className="mx-auto max-w-6xl">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Brand */}
                    <div>
                        <p className="text-lg font-semibold text-foreground">
                            Tripzy
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Plan smarter. Travel together.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Quick Links
                        </p>

                        <ul className="mt-4 space-y-2.5">
                            {QUICK_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Resources
                        </p>

                        <ul className="mt-4 space-y-2.5">
                            {RESOURCES.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Icons */}
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Connect
                        </p>

                        <div className="mt-4 flex gap-3">
                            {SOCIALS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                                >
                                    <social.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                </div>

                <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
                    © 2026 Tripzy. All rights reserved.
                </p>
            </div>
        </footer>
    );
}