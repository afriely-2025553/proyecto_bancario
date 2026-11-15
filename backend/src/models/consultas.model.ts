import { consultar } from '../config/db';
import { aCliente, FilaCliente, SQL_CLIENTE } from './clientes.model';
import { aCuenta, FilaCuenta, SQL_CUENTA } from './cuentas.model';

export async function buscarClientesPorTexto(texto: string) {
  const filas = await consultar<FilaCliente>(
    `${SQL_CLIENTE}
     WHERE CONCAT(codigo, ' ', identificacion, ' ', nombres, ' ', apellidos, ' ', correo) LIKE ?
     ORDER BY id DESC LIMIT 20`,
    [`%${texto}%`],
  );
  return filas.map(aCliente);
}

export async function buscarCuentasPorTexto(texto: string) {
  const filas = await consultar<FilaCuenta>(
    `${SQL_CUENTA}
     WHERE CONCAT(c.numero_cuenta, ' ', cl.codigo, ' ', cl.nombres, ' ', cl.apellidos, ' ', cl.identificacion) LIKE ?
     ORDER BY c.id DESC LIMIT 20`,
    [`%${texto}%`],
  );
  return filas.map(aCuenta);
}
