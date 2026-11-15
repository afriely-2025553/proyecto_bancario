import cors from 'cors';
import express from 'express';
import { consultar } from './config/db';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/errores';
import { routerClientes } from './routes/clientes.routes';
import { routerCuentas } from './routes/cuentas.routes';
import { routerTiposCuenta } from './routes/tipos-cuenta.routes';

export function crearApp() {
  const app = express();
  app.use(cors({ origin: ['http://localhost:4200', 'http://127.0.0.1:4200'] }));
  app.use(express.json());

  app.get('/api/salud', async (_req, res) => {
    await consultar('SELECT 1 AS ok');
    res.json({ estado: 'ok', sistema: 'banco-academico' });
  });

  app.use('/api/clientes', routerClientes);
  app.use('/api/cuentas', routerCuentas);
  app.use('/api/tipos-cuenta', routerTiposCuenta);

  app.use(rutaNoEncontrada);

  app.use(manejadorErrores);
  return app;
}
