import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, Menu, X } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "About", href: "about" }
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-[9999]">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="glass border-gradient rounded-2xl px-4 py-3 lg:px-5 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-primary/40 blur-md group-hover:blur-lg transition-all" />
              <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-background" />
              </div>
            </div>

            <span className="font-display font-bold text-base sm:text-lg">
              CareerGuide <span className="text-gradient">AI</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden lg:flex items-center gap-8 text-sm text-muted-foreground">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="hover:text-foreground transition-colors relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 rounded-xl text-sm hover:text-foreground hover:scale-105 transition-transform bg-gray-300"
            >
              Log in
            </Link>

            <Link to="/signup">
              <button className="px-5 py-2 rounded-xl text-sm text-primary-foreground bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
                Sign up
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden mt-2 glass rounded-2xl p-5">
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-muted-foreground hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}

              <li className="pt-3 border-t flex gap-4">
                <Link to="/login" className="flex-1">
                  <button className="w-full py-2 rounded-xl border">
                    Log in
                  </button>
                </Link>
                <Link to="/signup" className="flex-1">
                  <button className="w-full py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white">
                    Sign up
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export { Navbar };