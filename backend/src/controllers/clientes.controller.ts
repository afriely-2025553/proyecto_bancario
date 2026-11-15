import { Request, Response } from 'express';
import { ErrorApp } from '../middlewares/errores';
import { esquemaCliente, leerCuerpo } from '../middlewares/validacion';
import { actualizarActivoCliente, guardarCliente, listarClientes, obtenerCliente } from '../models/clientes.model';
import { enteroPositivo } from '../utils/utilidades';

const ETIQUETA_ID = 'El identificador del cliente';

async function cambiarActivo(id: number, activo: boolean) {
  const actual = await obtenerCliente(id);
  if (actual.activo === activo) {
    throw new ErrorApp(
      400,
      activo ? 'El cliente ya está activo.' : 'El cliente ya está desactivado.',
      activo ? 'CLIENTE_YA_ACTIVO' : 'CLIENTE_YA_INACTIVO',
    );
  }
  await actualizarActivoCliente(id, activo);
  return obtenerCliente(id);
}

export async function listar(req: Request, res: Response) {
  const q = String(req.query.q ?? '').trim();
  const estado = String(req.query.estado ?? '');
  const activo = estado === 'activos' ? 1 : estado === 'inactivos' ? 0 : null;
  res.json(await listarClientes(q, activo));
}

export async function obtener(req: Request<{ id: string }>, res: Response) {
  res.json(await obtenerCliente(enteroPositivo(req.params.id, ETIQUETA_ID)));
}

export async function crear(req: Request, res: Response) {
  const datos = leerCuerpo(esquemaCliente, req.body);
  res.status(201).json(await guardarCliente(datos));
}

export async function actualizar(req: Request<{ id: string }>, res: Response) {
  const id = enteroPositivo(req.params.id, ETIQUETA_ID);
  await obtenerCliente(id);
  const datos = leerCuerpo(esquemaCliente, req.body);
  res.json(await guardarCliente(datos, id));
}

export async function desactivar(req: Request<{ id: string }>, res: Response) {
  res.json(await cambiarActivo(enteroPositivo(req.params.id, ETIQUETA_ID), false));
}

export async function activar(req: Request<{ id: string }>, res: Response) {
  res.json(await cambiarActivo(enteroPositivo(req.params.id, ETIQUETA_ID), true));
}

/** DELETE no borra: desactiva y conserva el historial. */
export async function eliminar(req: Request<{ id: string }>, res: Response) {
  const cliente = await cambiarActivo(enteroPositivo(req.params.id, ETIQUETA_ID), false);
  res.json({ mensaje: 'Cliente desactivado. Su historial se conserva.', cliente });
}
