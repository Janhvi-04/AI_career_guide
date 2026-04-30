import React from "react";
import { Brain, BarChart3, Map, FileText } from "lucide-react";
const features = [
  {
    icon: Brain,
    title: "AI Career Recommendation",
    desc: "Get personalized career suggestions based on your skills, interests and personality.",
    color: "from-primary to-accent"
  },
  {
    icon: BarChart3,
    title: "Skill Gap Analysis",
    desc: "Identify your strengths and discover the exact skills you need to level up.",
    color: "from-accent to-primary"
  },
  {
    icon: Map,
    title: "Personalized Roadmaps",
    desc: "Step-by-step learning paths tailored to your unique career goals.",
    color: "from-primary to-accent"
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    desc: "Improve your resume with AI feedback and boost your interview chances.",
    color: "from-accent to-primary"
  }
];
function Features() {
  return /* @__PURE__ */ React.createElement("section", { id: "features", className: "relative py-24" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-center max-w-2xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm font-medium text-accent uppercase tracking-widest" }, "Features"), /* @__PURE__ */ React.createElement("h2", { className: "mt-3 text-4xl md:text-5xl font-bold" }, "Everything you need to ", /* @__PURE__ */ React.createElement("span", { className: "text-gradient" }, "build your future"))), /* @__PURE__ */ React.createElement("div", { className: "mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5" }, features.map((f, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: f.title,
      className: "group relative glass border-gradient rounded-2xl p-6 hover:-translate-y-2 transition-all duration-500",
      style: { animationDelay: `${i * 0.1}s` }
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500" }),
    /* @__PURE__ */ React.createElement("div", { className: `relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} glow-violet` }, /* @__PURE__ */ React.createElement(f.icon, { className: "h-6 w-6 text-primary-foreground" })),
    /* @__PURE__ */ React.createElement("h3", { className: "relative mt-5 text-lg font-bold" }, f.title),
    /* @__PURE__ */ React.createElement("p", { className: "relative mt-2 text-sm text-muted-foreground leading-relaxed" }, f.desc)
  )))));
}
export {
  Features
};
