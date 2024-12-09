import { defineConfig } from 'vite';

export default defineConfig({
    optimizeDeps: {
        include: [] // Vite will automatically scan and include dependencies
        },
        resolve: {
        alias: {
            '@': '/src' // Only basic source folder alias needed
        }
    }
});