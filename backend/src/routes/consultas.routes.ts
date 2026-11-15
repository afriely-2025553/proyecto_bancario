import { Router } from 'express';
import * as controlador from '../controllers/consultas.controller';

export const routerConsultas = Router();

routerConsultas.get('/', controlador.buscar);
routerConsultas.get('/saldo/:cuentaId', controlador.saldo);
