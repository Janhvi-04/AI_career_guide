import React from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
function NotFoundComponent() {
  return /* @__PURE__ */ React.createElement("div", { className: "flex min-h-screen items-center justify-center bg-background px-4" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-md text-center" }, /* @__PURE__ */ React.createElement("h1", { className: "text-7xl font-bold text-foreground" }, "404"), /* @__PURE__ */ React.createElement("h2", { className: "mt-4 text-xl font-semibold text-foreground" }, "Page not found"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-muted-foreground" }, "The page you're looking for doesn't exist or has been moved."), /* @__PURE__ */ React.createElement("div", { className: "mt-6" }, /* @__PURE__ */ React.createElement(
    Link,
    {
      to: "/",
      className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    },
    "Go home"
  ))));
}
const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ React.createElement("html", { lang: "en" }, /* @__PURE__ */ React.createElement("head", null, /* @__PURE__ */ React.createElement(HeadContent, null)), /* @__PURE__ */ React.createElement("body", null, children, /* @__PURE__ */ React.createElement(Scripts, null)));
}
function RootComponent() {
  return /* @__PURE__ */ React.createElement(Outlet, null);
}
export {
  Route
};
