import { Router } from 'express';
import * as controlador from '../controllers/cuentas.controller';

export const routerCuentas = Router();

routerCuentas.get('/', controlador.listar);
routerCuentas.get('/:id', controlador.obtener);
routerCuentas.post('/', controlador.crear);
