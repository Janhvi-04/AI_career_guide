import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import viteFont from "vite-font";

export default defineConfig({
  plugins: [
    viteFont({
      // TanStack Start builds its own <head>, so there is no index.html to transform.
      // The tags are pulled from `virtual:vite-font` in src/routes/__root.jsx instead.
      injectHtml: false,
      config: [
        {
          // Headings (--font-display). `300..700` is Space Grotesk's full variable range;
          // without an explicit weight Google only serves the single 400 face, which would
          // leave every `font-bold` heading faux-bolded.
          name: "Space Grotesk",
          weight: "300..700",
          fallbackName: "Space Grotesk Fallback",
          fallback: "sans-serif",
          subsets: ["latin"],
          display: "swap",
          fetch: true,
        },
        {
          // Body (--font-sans). The UI uses 400 through 900 (font-black).
          name: "Inter",
          weight: "100..900",
          fallbackName: "Inter Fallback",
          fallback: "sans-serif",
          subsets: ["latin"],
          display: "swap",
          fetch: true,
        },
      ],
    }),
  ],
});
