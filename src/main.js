import '@ionic/core/css/core.css';
import '@ionic/core/css/normalize.css';
import '@ionic/core/css/structure.css';
import '@ionic/core/css/typography.css';
import '@ionic/core/css/padding.css';
import './styles.css';
import { startApp } from './app.js';

// Carga Ionic antes de montar la interfaz; la carpeta se copia por Vite.
const ionicModule = '/ionic.esm.js';
import(/* @vite-ignore */ ionicModule).then(() => startApp()).catch((error) => {
  console.error('No fue posible iniciar Ionic:', error);
  document.getElementById('app').textContent = 'Error al cargar Ionic. Ejecuta npm install y npm run dev.';
});
