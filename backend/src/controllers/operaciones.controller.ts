import { Request, Response } from 'express';
import { esquemaOperacion, esquemaTransferencia, leerCuerpo, leerMonto } from '../middlewares/validacion';
import { operarCuenta, transferir } from '../models/operaciones.model';

function registrarOperacion(tipo: 'deposito' | 'retiro', descripcionPorDefecto: string) {
  return async (req: Request, res: Response) => {
    const datos = leerCuerpo(esquemaOperacion, req.body);
    const monto = leerMonto(datos.monto);
    const descripcion = datos.descripcion || descripcionPorDefecto;
    const movimiento = await operarCuenta(datos.cuentaId, monto, tipo, descripcion, req.usuario!.id);
    res.status(201).json({ movimiento });
  };
}

export const depositar = registrarOperacion('deposito', 'Depósito en ventanilla');
export const retirar = registrarOperacion('retiro', 'Retiro en ventanilla');

export async function crearTransferencia(req: Request, res: Response) {
  const datos = leerCuerpo(esquemaTransferencia, req.body);
  const monto = leerMonto(datos.monto);
  const resultado = await transferir(
    datos.cuentaOrigenId,
    datos.cuentaDestinoId,
    monto,
    datos.concepto || null,
    req.usuario!.id,
  );
  res.status(201).json(resultado);
}

