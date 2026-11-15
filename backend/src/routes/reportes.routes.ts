import { Router } from 'express';
import * as controlador from '../controllers/reportes.controller';

export const routerReportes = Router();

routerReportes.get('/operaciones', controlador.operaciones);
