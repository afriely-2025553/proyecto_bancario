import { Router } from 'express';
import * as controlador from '../controllers/operaciones.controller';

export const routerDepositos = Router();
routerDepositos.post('/', controlador.depositar);

export const routerRetiros = Router();
routerRetiros.post('/', controlador.retirar);

export const routerTransferencias = Router();
routerTransferencias.post('/', controlador.crearTransferencia);

