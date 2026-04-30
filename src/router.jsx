import React from "react";
import { createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
function DefaultErrorComponent({ error, reset }) {
  const router = useRouter();
  return /* @__PURE__ */ React.createElement("div", { className: "flex min-h-screen items-center justify-center bg-background px-4" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-md text-center" }, /* @__PURE__ */ React.createElement("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10" }, /* @__PURE__ */ React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      className: "h-8 w-8 text-destructive",
      fill: "none",
      viewBox: "0 0 24 24",
      stroke: "currentColor",
      strokeWidth: 2
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      }
    )
  )), /* @__PURE__ */ React.createElement("h1", { className: "text-2xl font-bold tracking-tight text-foreground" }, "Something went wrong"), /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-sm text-muted-foreground" }, "An unexpected error occurred. Please try again."), import.meta.env.DEV && error.message && /* @__PURE__ */ React.createElement("pre", { className: "mt-4 max-h-40 overflow-auto rounded-md bg-muted p-3 text-left font-mono text-xs text-destructive" }, error.message), /* @__PURE__ */ React.createElement("div", { className: "mt-6 flex items-center justify-center gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        router.invalidate();
        reset();
      },
      className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    },
    "Try again"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "/",
      className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
    },
    "Go home"
  ))));
}
const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router;
};
export {
  getRouter
};
