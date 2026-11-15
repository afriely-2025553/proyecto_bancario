import { Router } from 'express';
import * as controlador from '../controllers/movimientos.controller';

export const routerMovimientos = Router();

routerMovimientos.get('/', controlador.listar);
routerMovimientos.get('/cuenta/:cuentaId', controlador.listarPorCuenta);
routerMovimientos.post('/', controlador.registrar);
