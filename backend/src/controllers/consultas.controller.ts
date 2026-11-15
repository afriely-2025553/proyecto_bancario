import { Request, Response } from 'express';
import { ErrorApp } from '../middlewares/errores';
import { buscarClientesPorTexto, buscarCuentasPorTexto } from '../models/consultas.model';
import { obtenerCuenta } from '../models/cuentas.model';
import { enteroPositivo } from '../utils/utilidades';

export async function buscar(req: Request, res: Response) {
  const q = String(req.query.q ?? '').trim();
  if (!q) {
    throw new ErrorApp(400, 'Escriba un texto para buscar clientes o cuentas.', 'CONSULTA_VACIA');
  }
  res.json({
    criterio: q,
    clientes: await buscarClientesPorTexto(q),
    cuentas: await buscarCuentasPorTexto(q),
  });
}

export async function saldo(req: Request<{ cuentaId: string }>, res: Response) {
  const cuenta = await obtenerCuenta(enteroPositivo(req.params.cuentaId, 'El identificador de la cuenta'));
  res.json({
    cuentaId: cuenta.id,
    numeroCuenta: cuenta.numeroCuenta,
    clienteNombre: cuenta.clienteNombre,
    saldo: cuenta.saldo,
    estado: cuenta.estado,
  });
}
