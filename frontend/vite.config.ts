
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
    vite: {
        build: {
        rollupOptions: {
            external: ['pdfjs-dist', 'pdfjs-dist/build/pdf', 'pdfjs-dist/legacy/build/pdf.mjs'],
        },
        },
    },
});
