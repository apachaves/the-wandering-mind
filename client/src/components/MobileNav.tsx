// The Wandering Mind — Mobile Navigation Component
// Design: Warm Naturalist — slide-down menu with all navigation links
// Used on all pages to ensure Anderson's Notes, About, and Support are accessible on mobile

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const NAV_LINKS = [
  { href: "/", icon: "◉", label: "All Notes" },
  { href: "/notes", icon: "✧", label: "Anderson's Notes" },
  { href: "/about", icon: "✦", label: "About Us" },
  { href: "/support", icon: "♡", label: "Support" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile header bar */}
      <div
        className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30"
        style={{
          background: "oklch(0.97 0.012 80 / 0.95)",
          borderColor: "oklch(0.86 0.022 75)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 rounded-sm transition-all duration-200"
            style={{
              background: isOpen ? "oklch(0.90 0.030 145)" : "transparent",
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            <span
              className="block w-4.5 h-0.5 rounded-full transition-all duration-300"
              style={{
                width: "18px",
                background: isOpen ? "oklch(0.35 0.10 155)" : "oklch(0.40 0.025 65)",
                transform: isOpen ? "rotate(45deg) translateY(4px)" : "none",
              }}
            />
            <span
              className="block w-4.5 h-0.5 rounded-full transition-all duration-300"
              style={{
                width: "18px",
                background: isOpen ? "oklch(0.35 0.10 155)" : "oklch(0.40 0.025 65)",
                opacity: isOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-4.5 h-0.5 rounded-full transition-all duration-300"
              style={{
                width: "18px",
                background: isOpen ? "oklch(0.35 0.10 155)" : "oklch(0.40 0.025 65)",
                transform: isOpen ? "rotate(-45deg) translateY(-4px)" : "none",
              }}
            />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663028356061/heMWDNsfnkhKvKXJ.png"
              alt="Capybara mascot"
              className="w-8 h-8 rounded-full object-cover"
              style={{ border: "1.5px solid oklch(0.86 0.022 75)" }}
            />
            <h1
              className="text-lg font-bold"
              style={{
                fontFamily: "'Lora', Georgia, serif",
                color: "oklch(0.20 0.025 60)",
              }}
            >
              The Wandering Mind
            </h1>
          </Link>
        </div>
        <LanguageSwitcher compact />
      </div>

      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20"
          style={{ background: "oklch(0.20 0.025 60 / 0.3)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-down menu panel */}
      <div
        className="lg:hidden fixed left-0 right-0 z-25 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          top: "53px", // height of mobile header
          maxHeight: isOpen ? "80vh" : "0",
          opacity: isOpen ? 1 : 0,
          zIndex: 25,
        }}
      >
        <div
          className="border-b shadow-lg overflow-y-auto"
          style={{
            background: "oklch(0.95 0.018 78)",
            borderColor: "oklch(0.86 0.022 75)",
            boxShadow: "0 8px 32px oklch(0.20 0.025 60 / 0.12)",
            maxHeight: "80vh",
          }}
        >
          {/* Navigation links */}
          <nav className="p-4">
            <div
              className="text-xs uppercase tracking-widest mb-3 px-3"
              style={{
                color: "oklch(0.62 0.018 70)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Navigate
            </div>
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = location === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-3 rounded-sm text-sm transition-all duration-200"
                      style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        background: isActive ? "oklch(0.90 0.030 145)" : "transparent",
                        color: isActive ? "oklch(0.35 0.10 155)" : "oklch(0.40 0.025 65)",
                        borderLeft: isActive
                          ? "2px solid oklch(0.42 0.10 155)"
                          : "2px solid transparent",
                        fontWeight: isActive ? "500" : "400",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                        {link.icon}
                      </span>
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Divider */}
          <div
            className="mx-4 border-t"
            style={{ borderColor: "oklch(0.86 0.022 75)" }}
          />

          {/* Footer quote */}
          <div className="p-4">
            <p
              className="text-xs leading-relaxed px-3"
              style={{
                color: "oklch(0.60 0.020 70)",
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: "italic",
              }}
            >
              "The question is not whether to intervene in nature — we've been
              intervening for ten thousand years. The question is how to
              intervene wisely."
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
