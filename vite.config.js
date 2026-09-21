import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        chunkSizeWarningLimit: 700,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return;
                    }

                    if (id.includes('html2canvas') || id.includes('jspdf') || id.includes('pdfmake')) {
                        return 'reporting-vendor';
                    }

                    if (id.includes('react') || id.includes('@inertiajs') || id.includes('scheduler')) {
                        return 'react-vendor';
                    }

                    if (id.includes('lucide-react') || id.includes('clsx')) {
                        return 'ui-vendor';
                    }

                    if (id.includes('chart') || id.includes('d3') || id.includes('recharts')) {
                        return 'charting-vendor';
                    }

                    return 'vendor';
                },
            },
        },
    },
});
