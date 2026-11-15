import { RowDataPacket } from 'mysql2';
import { consultar } from '../config/db';
import { dinero } from '../utils/utilidades';

const SQL_MOVIMIENTO = `
  SELECT m.id, m.cuenta_id, c.numero_cuenta, m.transferencia_id, t.referencia,
         CASE
           WHEN m.tipo = 'transferencia_salida' THEN dest.numero_cuenta
           WHEN m.tipo = 'transferencia_entrada' THEN orig.numero_cuenta
         END AS cuenta_contraparte,
         m.tipo, m.monto, m.saldo_anterior, m.saldo_posterior, m.descripcion, m.fecha,
         u.nombre_usuario AS operador
  FROM movimiento m
  INNER JOIN cuenta c ON c.id = m.cuenta_id
  LEFT JOIN transferencia t ON t.id = m.transferencia_id
  LEFT JOIN cuenta orig ON orig.id = t.cuenta_origen_id
  LEFT JOIN cuenta dest ON dest.id = t.cuenta_destino_id
  LEFT JOIN usuario u ON u.id = m.usuario_id
`;

function aMovimiento(fila: RowDataPacket) {
  return {
    id: fila.id,
    cuentaId: fila.cuenta_id,
    numeroCuenta: fila.numero_cuenta,
    referencia: fila.referencia,
    cuentaContraparte: fila.cuenta_contraparte,
    tipo: fila.tipo,
    monto: dinero(fila.monto),
    saldoAnterior: dinero(fila.saldo_anterior),
    saldoPosterior: dinero(fila.saldo_posterior),
    descripcion: fila.descripcion,
    fecha: fila.fecha,
    operador: fila.operador,
  };
}

export async function listarMovimientos(filtro: {
  cuentaId: number | null;
  tipo: string | null;
  desde: string | null;
  hasta: string | null;
  limite?: number;
}) {
  const filas = await consultar<RowDataPacket>(
    `${SQL_MOVIMIENTO}
     WHERE (? IS NULL OR m.cuenta_id = ?)
       AND (? IS NULL OR m.tipo = ?)
       AND (? IS NULL OR m.fecha >= ?)
       AND (? IS NULL OR m.fecha < DATE_ADD(?, INTERVAL 1 DAY))
     ORDER BY m.fecha DESC, m.id DESC
     LIMIT ?`,
    [
      filtro.cuentaId, filtro.cuentaId,
      filtro.tipo, filtro.tipo,
      filtro.desde, filtro.desde,
      filtro.hasta, filtro.hasta,
      filtro.limite ?? 200,
    ],
  );
  return filas.map(aMovimiento);
}
