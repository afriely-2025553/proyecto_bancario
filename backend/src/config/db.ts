import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { configuracion } from './config';

let pool: Pool | null = null;

export function obtenerPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...configuracion().db,
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true,
    });
  }
  return pool;
}

/** Ejecuta un SELECT y devuelve las filas. */
export async function consultar<T extends RowDataPacket>(sql: string, parametros: unknown[] = []): Promise<T[]> {
  const [filas] = await obtenerPool().query<T[]>(sql, parametros);
  return filas;
}

/** Ejecuta un INSERT, UPDATE o DELETE y devuelve el resultado (insertId, filas afectadas). */
export async function ejecutar(sql: string, parametros: unknown[] = []): Promise<ResultSetHeader> {
  const [resultado] = await obtenerPool().query<ResultSetHeader>(sql, parametros);
  return resultado;
}

/** Ejecuta varias instrucciones como una sola unidad: o se confirman todas o ninguna. */
export async function enTransaccion<T>(trabajo: (conexion: PoolConnection) => Promise<T>): Promise<T> {
  const conexion = await obtenerPool().getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await trabajo(conexion);
    await conexion.commit();
    return resultado;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

export async function cerrarPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
