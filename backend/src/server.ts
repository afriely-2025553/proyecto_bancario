import { crearApp } from './app';
import { configuracion } from './config/config';

const { puerto } = configuracion();

crearApp().listen(puerto, () => {
  console.log(`API del sistema bancario en http://localhost:${puerto}`);
});
