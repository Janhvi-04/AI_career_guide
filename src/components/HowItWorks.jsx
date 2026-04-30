import React from "react";
const steps = [
  {
    n: "01",
    title: "Tell Us About You",
    desc: "Share your skills, interests and career preferences in minutes."
  },
  {
    n: "02",
    title: "Get AI Insights",
    desc: "Our AI analyzes your profile and recommends the best career paths for you."
  },
  {
    n: "03",
    title: "Achieve Your Goals",
    desc: "Follow personalized roadmaps and track your progress toward success."
  }
];
function HowItWorks() {
  return /* @__PURE__ */ React.createElement("section", { id: "how", className: "relative py-24" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-center max-w-2xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm font-medium text-accent uppercase tracking-widest" }, "Process"), /* @__PURE__ */ React.createElement("h2", { className: "mt-3 text-4xl md:text-5xl font-bold" }, "How It ", /* @__PURE__ */ React.createElement("span", { className: "text-gradient" }, "Works"))), /* @__PURE__ */ React.createElement("div", { className: "mt-20 relative grid md:grid-cols-3 gap-10" }, /* @__PURE__ */ React.createElement("div", { className: "hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" }), steps.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.n, className: "relative text-center" }, /* @__PURE__ */ React.createElement("div", { className: "relative mx-auto h-20 w-20" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-xl opacity-60 animate-pulse-glow" }), /* @__PURE__ */ React.createElement("div", { className: "relative h-full w-full rounded-full glass border-gradient flex items-center justify-center" }, /* @__PURE__ */ React.createElement("span", { className: "font-display font-bold text-2xl text-gradient" }, s.n))), /* @__PURE__ */ React.createElement("h3", { className: "mt-6 text-xl font-bold" }, s.title), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-muted-foreground max-w-xs mx-auto" }, s.desc))))));
}
export {
  HowItWorks
};
