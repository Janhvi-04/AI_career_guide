import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerGuide AI \u2014 Find Your Perfect Career with AI" },
      {
        name: "description",
        content: "AI-powered career guidance with personalized recommendations, skill gap analysis, and step-by-step roadmaps to achieve your career goals."
      },
      { property: "og:title", content: "CareerGuide AI \u2014 Find Your Perfect Career with AI" },
      {
        property: "og:description",
        content: "Personalized AI career recommendations, skill gap analysis and roadmaps to build your future."
      }
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap"
      }
    ]
  }),
  component: Index
});
function Index() {
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen relative overflow-x-hidden" }, /* @__PURE__ */ React.createElement(Navbar, null), /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(Features, null), /* @__PURE__ */ React.createElement(HowItWorks, null), /* @__PURE__ */ React.createElement(CtaSection, null)), /* @__PURE__ */ React.createElement(Footer, null));
}
export {
  Route
};
