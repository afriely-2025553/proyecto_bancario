import { Router } from 'express';
import * as controlador from '../controllers/auth.controller';
import { exigirAuth } from '../middlewares/auth';

export const routerAuth = Router();

routerAuth.post('/login', controlador.login);
routerAuth.get('/yo', exigirAuth, controlador.yo);
routerAuth.post('/logout', exigirAuth, controlador.logout);
