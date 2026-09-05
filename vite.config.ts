import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        // pdfjs-dist and html2pdf.js are dynamically imported at their call
        // sites, so Rollup splits them out on its own. Only Chart.js needs a
        // manual hint — it is imported statically by the Trends tab.
        manualChunks: {
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
});
