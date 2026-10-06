import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base './' permite publicar en cualquier repositorio de GitHub Pages sin cambiar nada
export default defineConfig({ base: './', plugins: [svelte()] });
