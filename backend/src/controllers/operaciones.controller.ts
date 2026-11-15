import { Request, Response } from 'express';
import { esquemaOperacion, leerCuerpo, leerMonto } from '../middlewares/validacion';
import { operarCuenta } from '../models/operaciones.model';

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
