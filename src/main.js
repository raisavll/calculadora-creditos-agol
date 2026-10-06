import { mount } from 'svelte';
import App from './App.svelte';

const target = document.getElementById('app');
target.textContent = ''; // quita el aviso "Cargando…" antes de dibujar la aplicación
mount(App, { target });
