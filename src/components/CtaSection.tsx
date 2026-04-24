import { ArrowRight, Trophy } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl glass border-gradient p-10 md:p-14">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

          <div className="relative flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full" />
                <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-violet">
                  <Trophy className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold">
                  Start your journey towards a <span className="text-gradient">better future</span>
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Join thousands of students already building their dream careers.
                </p>
              </div>
            </div>

            <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground glow-violet hover:scale-105 transition-transform shrink-0">
              Sign Up Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
