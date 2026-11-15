import { Request, Response } from 'express';
import { listarMovimientos } from '../models/movimientos.model';
import { resumenClientes, resumenCuentas, totales } from '../models/reportes.model';
import { leerFecha } from '../utils/utilidades';

export async function operaciones(req: Request, res: Response) {
  const desde = leerFecha(req.query.desde, 'La fecha inicial');
  const hasta = leerFecha(req.query.hasta, 'La fecha final');
  res.json({
    periodo: { desde, hasta },
    depositos: await totales('movimiento', "tipo = 'deposito'", desde, hasta),
    retiros: await totales('movimiento', "tipo = 'retiro'", desde, hasta),
    transferencias: await totales('transferencia', '1 = 1', desde, hasta),
    cuentas: await resumenCuentas(),
    clientes: await resumenClientes(),
    ultimasOperaciones: await listarMovimientos({ cuentaId: null, tipo: null, desde, hasta, limite: 8 }),
  });
}
