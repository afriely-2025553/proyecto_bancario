import { Request, Response } from 'express';
import { esquemaMovimiento, leerCuerpo, leerMonto } from '../middlewares/validacion';
import { listarMovimientos } from '../models/movimientos.model';
import { operarCuenta } from '../models/operaciones.model';
import { enteroPositivo, leerFecha } from '../utils/utilidades';

const TIPOS = ['deposito', 'retiro', 'transferencia_salida', 'transferencia_entrada'];

function filtroDesde(query: Record<string, unknown>, cuentaId: number | null) {
  const tipo = TIPOS.includes(String(query.tipo)) ? String(query.tipo) : null;
  return {
    cuentaId,
    tipo,
    desde: leerFecha(query.desde, 'La fecha inicial'),
    hasta: leerFecha(query.hasta, 'La fecha final'),
  };
}

export async function listar(req: Request, res: Response) {
  const cuentaId = req.query.cuentaId
    ? enteroPositivo(String(req.query.cuentaId), 'El identificador de la cuenta')
    : null;
  res.json(await listarMovimientos(filtroDesde(req.query, cuentaId)));
}

export async function listarPorCuenta(req: Request<{ cuentaId: string }>, res: Response) {
  const cuentaId = enteroPositivo(req.params.cuentaId, 'El identificador de la cuenta');
  res.json(await listarMovimientos(filtroDesde(req.query, cuentaId)));
}

/** POST genérico que registra un depósito o un retiro. */
export async function registrar(req: Request, res: Response) {
  const datos = leerCuerpo(esquemaMovimiento, req.body);
  const monto = leerMonto(datos.monto);
  const descripcion = datos.descripcion || (datos.tipo === 'deposito' ? 'Depósito en ventanilla' : 'Retiro en ventanilla');
  const movimiento = await operarCuenta(datos.cuentaId, monto, datos.tipo, descripcion, req.usuario!.id);
  res.status(201).json({ movimiento });
}
