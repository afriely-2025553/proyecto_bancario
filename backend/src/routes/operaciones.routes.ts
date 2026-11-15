import { Router } from 'express';
import * as controlador from '../controllers/operaciones.controller';

export const routerDepositos = Router();
routerDepositos.post('/', controlador.depositar);

export const routerRetiros = Router();
routerRetiros.post('/', controlador.retirar);
