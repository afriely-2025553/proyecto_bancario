import { Router } from 'express';
import * as controlador from '../controllers/clientes.controller';

export const routerClientes = Router();

routerClientes.get('/', controlador.listar);
routerClientes.get('/:id', controlador.obtener);
routerClientes.post('/', controlador.crear);
routerClientes.put('/:id', controlador.actualizar);
routerClientes.patch('/:id/desactivar', controlador.desactivar);
routerClientes.patch('/:id/activar', controlador.activar);
routerClientes.delete('/:id', controlador.eliminar);
