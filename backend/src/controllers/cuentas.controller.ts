import { Request, Response } from 'express';
import { ErrorApp } from '../middlewares/errores';
import { esquemaCuentaNueva, esquemaEstadoCuenta, leerCuerpo } from '../middlewares/validacion';
import {
  actualizarEstadoCuenta,
  insertarCuenta,
  leerEstadoCliente,
  leerTipoCuenta,
  listarCuentas,
  listarTiposCuenta,
  obtenerCuenta,
} from '../models/cuentas.model';
import { bandera, enteroPositivo } from '../utils/utilidades';

const ETIQUETA_ID = 'La cuenta';

export async function listar(req: Request, res: Response) {
  const q = String(req.query.q ?? '').trim();
  const clienteId = req.query.clienteId
    ? enteroPositivo(String(req.query.clienteId), 'El identificador del cliente')
    : null;
  const estado = ['activa', 'inactiva'].includes(String(req.query.estado)) ? String(req.query.estado) : null;
  res.json(await listarCuentas({ clienteId, estado, q }));
}

export async function obtener(req: Request<{ id: string }>, res: Response) {
  res.json(await obtenerCuenta(enteroPositivo(req.params.id, ETIQUETA_ID)));
}

export async function crear(req: Request, res: Response) {
  const datos = leerCuerpo(esquemaCuentaNueva, req.body);
  const cliente = await leerEstadoCliente(datos.clienteId);
  if (!cliente) {
    throw new ErrorApp(404, 'El cliente no existe.', 'CLIENTE_NO_ENCONTRADO');
  }
  if (!bandera(cliente.activo)) {
    throw new ErrorApp(400, 'No se puede abrir una cuenta a un cliente desactivado.', 'CLIENTE_INACTIVO');
  }
  const tipo = await leerTipoCuenta(datos.tipoCuentaId);
  if (!tipo || !bandera(tipo.activo)) {
    throw new ErrorApp(400, 'El tipo de cuenta no está disponible.', 'TIPO_CUENTA_INVALIDO');
  }
  const id = await insertarCuenta(datos.clienteId, datos.tipoCuentaId);
  res.status(201).json(await obtenerCuenta(id));
}

export async function saldo(req: Request<{ id: string }>, res: Response) {
    const cuenta = await obtenerCuenta(enteroPositivo(req.params.id, ETIQUETA_ID));
    res.json({
      cuentaId: cuenta.id,
      numeroCuenta: cuenta.numeroCuenta,
      clienteNombre: cuenta.clienteNombre,
      saldo: cuenta.saldo,
      estado: cuenta.estado,
    });
  }
  
  export async function cambiarEstado(req: Request<{ id: string }>, res: Response) {
    const id = enteroPositivo(req.params.id, ETIQUETA_ID);
    await obtenerCuenta(id);
    const datos = leerCuerpo(esquemaEstadoCuenta, req.body);
    await actualizarEstadoCuenta(id, datos.estado);
    res.json(await obtenerCuenta(id));
  }
  
  export async function listarTipos(_req: Request, res: Response) {
  
  res.json(await listarTiposCuenta());
}
