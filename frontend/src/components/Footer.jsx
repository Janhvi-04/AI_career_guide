import React from "react";
import { GraduationCap } from "lucide-react";

function Footer() {
  return (
    <footer className="relative border-t border-border/50 py-10">
      <div className=" flex flex-col mx-auto max-w-7xl px-6 items-center gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-background" />
          </div>

          <span className="font-display font-bold">
            CareerGuide <span className="text-gradient">AI</span>
          </span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CareerGuide AI. Built for the future.
        </p>

      </div>
    </footer>
  );
}

export { Footer };