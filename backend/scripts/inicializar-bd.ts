import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { configuracion } from '../src/config/config';

async function main(): Promise<void> {
  const db = configuracion().db;
  const conexion = await mysql.createConnection({ ...db, multipleStatements: true });
  const carpeta = path.resolve(__dirname, '../../database');
  await conexion.query(fs.readFileSync(path.join(carpeta, 'schema.sql'), 'utf8'));
  await conexion.query(fs.readFileSync(path.join(carpeta, 'seed.sql'), 'utf8'));
  await conexion.end();
  console.log(`Base de datos lista: ${db.database}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
