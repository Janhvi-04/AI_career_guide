import React from "react";
import { GraduationCap } from "lucide-react";
function Footer() {
  return /* @__PURE__ */ React.createElement("footer", { className: "relative border-t border-border/50 py-10" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center" }, /* @__PURE__ */ React.createElement(GraduationCap, { className: "h-4 w-4 text-background" })), /* @__PURE__ */ React.createElement("span", { className: "font-display font-bold" }, "CareerGuide ", /* @__PURE__ */ React.createElement("span", { className: "text-gradient" }, "AI"))), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-muted-foreground" }, "\xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " CareerGuide AI. Built for the future.")));
}
export {
  Footer
};
