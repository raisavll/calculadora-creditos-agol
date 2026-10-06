import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base './' permite publicar en cualquier repositorio de GitHub Pages sin cambiar nada
// pdfmake (~900 kB) solo se descarga al pulsar "Descargar PDF", por eso se sube el límite del aviso
export default defineConfig({ base: './', plugins: [svelte()], build: { chunkSizeWarningLimit: 1000 } });
