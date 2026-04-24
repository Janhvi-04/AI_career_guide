const steps = [
  {
    n: "01",
    title: "Tell Us About You",
    desc: "Share your skills, interests and career preferences in minutes.",
  },
  {
    n: "02",
    title: "Get AI Insights",
    desc: "Our AI analyzes your profile and recommends the best career paths for you.",
  },
  {
    n: "03",
    title: "Achieve Your Goals",
    desc: "Follow personalized roadmaps and track your progress toward success.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-sm font-medium text-accent uppercase tracking-widest">Process</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold">
            How It <span className="text-gradient">Works</span>
          </h2>
        </div>

        <div className="mt-20 relative grid md:grid-cols-3 gap-10">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {steps.map((s) => (
            <div key={s.n} className="relative text-center">
              <div className="relative mx-auto h-20 w-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-xl opacity-60 animate-pulse-glow" />
                <div className="relative h-full w-full rounded-full glass border-gradient flex items-center justify-center">
                  <span className="font-display font-bold text-2xl text-gradient">{s.n}</span>
                </div>
              </div>
              <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
