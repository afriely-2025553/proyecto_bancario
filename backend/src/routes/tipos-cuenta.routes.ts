import { Router } from 'express';
import * as controlador from '../controllers/cuentas.controller';

export const routerTiposCuenta = Router();

routerTiposCuenta.get('/', controlador.listarTipos);
