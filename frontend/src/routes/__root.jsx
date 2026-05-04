import React from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Navbar } from "../components/Navbar";
import {Toaster} from "react-hot-toast"
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
      { title: "CareerGuide AI \u2014 Find Your Perfect Career with AI" },
      { name: "description", content: "Find Your Perfect Career with AI" },
      { name: "author", content: "CareerGuide AI" },
      { property: "og:title", content: "CareerGuide AI" },
      { property: "og:description", content: "Find Your Perfect Career with AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@careerguideai" }
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
  return /* @__PURE__ */ (
    <html lang="en">
      <head>
        <HeadContent/>
      </head>
      <body>
        {children}
        <Scripts/>
      </body>
    </html>
  );
}
function RootComponent() {
  return /* @__PURE__ */(
    <>
    <Toaster position="top-right"/>
    <Outlet/>
    </>
  );
}
export {
  Route
};
