// Formas de los datos que responde la API. 

export type Rol = 'administrador' | 'cajero';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  rol: Rol;
}

export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

export interface Cliente {
  id: number;
  codigo: string;
  identificacion: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string | null;
  telefono: string | null;
  correo: string;
  direccion: string | null;
  activo: boolean;
  fechaRegistro: string;
}

export type DatosCliente = Pick<
  Cliente,
  'identificacion' | 'nombres' | 'apellidos' | 'fechaNacimiento' | 'telefono' | 'correo' | 'direccion'
>;

export interface TipoCuenta {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export type EstadoCuenta = 'activa' | 'inactiva';

export interface Cuenta {
  id: number;
  numeroCuenta: string;
  clienteId: number;
  clienteCodigo: string;
  clienteNombre: string;
  clienteActivo: boolean;
  tipoCuentaId: number;
  tipoCuenta: string;
  saldo: number;
  estado: EstadoCuenta;
  fechaApertura: string;
}

export type TipoMovimiento = 'deposito' | 'retiro' | 'transferencia_salida' | 'transferencia_entrada';

export const NOMBRE_MOVIMIENTO: Record<TipoMovimiento, string> = {
  deposito: 'Depósito',
  retiro: 'Retiro',
  transferencia_salida: 'Transferencia enviada',
  transferencia_entrada: 'Transferencia recibida',
};

export interface Movimiento {
  id: number;
  cuentaId: number;
  numeroCuenta: string;
  referencia: string | null;
  cuentaContraparte: string | null;
  tipo: TipoMovimiento;
  monto: number;
  saldoAnterior: number;
  saldoPosterior: number;
  descripcion: string | null;
  fecha: string;
  operador?: string | null;
}

export interface ResultadoTransferencia {
  transferencia: { id: number; referencia: string; cuentaOrigen: string; cuentaDestino: string; monto: number };
  movimientoOrigen: Movimiento;
  movimientoDestino: Movimiento;
}

export interface Consulta {
  criterio: string;
  clientes: Cliente[];
  cuentas: Cuenta[];
}

export interface Total {
  cantidad: number;
  monto: number;
}

export interface Reporte {
  periodo: { desde: string | null; hasta: string | null };
  depositos: Total;
  retiros: Total;
  transferencias: Total;
  cuentas: { activas: number; inactivas: number; saldoTotal: number };
  clientes: { activos: number; inactivos: number };
  ultimasOperaciones: Movimiento[];
}
