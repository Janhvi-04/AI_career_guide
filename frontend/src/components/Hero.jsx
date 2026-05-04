import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import heroOrb from "@/assets/hero-orb.jpg";

function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">

      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">

        {/* Left content */}
        <div className="animate-fade-in-up">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass border-gradient rounded-full px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">AI-Powered Career Guidance</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05]">
            Find Your Perfect{" "}
            <span className="block">
              Career with{" "}
              <span className="relative text-gradient">AI</span>
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Get personalized career recommendations, skill gap analysis, roadmaps and resources to achieve your dreams.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">

            <Link to="/signup">
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>

            <Link to="/learn-more">
              <button className="px-7 py-3.5 rounded-xl font-medium glass border-gradient hover:bg-secondary/40 transition-colors">
                Learn More
              </button>
            </Link>

          </div>

          {/* Features */}
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
            {["100% Free", "AI Powered", "Personalized for You"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right content (image + stats) */}
        <div className="relative animate-fade-in-up mt-10 lg:mt-0">

          {/* Glow background */}
          <div className="absolute -inset-10 bg-gradient-to-tr from-primary/30 via-accent/20 to-transparent blur-3xl animate-pulse-glow" />

          {/* Image */}
          <div className="relative animate-float">
            <img
              src={heroOrb}
              alt="AI brain visualization with orbital data rings"
              className="w-full h-auto rounded-3xl"
            />
          </div>

          {/* Stats */}
          <div className="relative z-10 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div className="glass border-gradient rounded-2xl px-4 py-3">
              <div className="text-xs text-muted-foreground">Match Score</div>
              <div className="font-display font-bold text-2xl text-gradient">85%</div>
            </div>

            <div className="glass border-gradient rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
                <div>
                  <div className="text-xs text-muted-foreground">Recommended</div>
                  <div className="font-medium truncate">Full Stack Dev</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export { Hero };