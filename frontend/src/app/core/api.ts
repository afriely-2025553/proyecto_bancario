import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Cliente,
  Consulta,
  Cuenta,
  DatosCliente,
  EstadoCuenta,
  Movimiento,
  Reporte,
  RespuestaLogin,
  ResultadoTransferencia,
  TipoCuenta,
} from './modelos';

// Ruta relativa: en desarrollo, proxy.conf.json la reenvía a http://127.0.0.1:3000.
const API = '/api';

/** Quita los filtros vacíos para no enviar parámetros como ?q=&estado= */
function parametros(filtros: Record<string, string | number | null | undefined>): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== null && valor !== undefined && valor !== '') {
      params = params.set(clave, String(valor));
    }
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  login(nombreUsuario: string, contrasena: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${API}/auth/login`, { nombreUsuario, contrasena });
  }

  logout(): Observable<unknown> {
    return this.http.post(`${API}/auth/logout`, {});
  }

  clientes(q = '', estado = ''): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${API}/clientes`, { params: parametros({ q, estado }) });
  }

  cliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${API}/clientes/${id}`);
  }

  crearCliente(datos: DatosCliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${API}/clientes`, datos);
  }

  actualizarCliente(id: number, datos: DatosCliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${API}/clientes/${id}`, datos);
  }

  desactivarCliente(id: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${API}/clientes/${id}/desactivar`, {});
  }

  activarCliente(id: number): Observable<Cliente> {
    return this.http.patch<Cliente>(`${API}/clientes/${id}/activar`, {});
  }

  tiposCuenta(): Observable<TipoCuenta[]> {
    return this.http.get<TipoCuenta[]>(`${API}/tipos-cuenta`);
  }

  cuentas(filtros: { q?: string; clienteId?: number; estado?: string } = {}): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${API}/cuentas`, { params: parametros(filtros) });
  }

  crearCuenta(clienteId: number, tipoCuentaId: number): Observable<Cuenta> {
    return this.http.post<Cuenta>(`${API}/cuentas`, { clienteId, tipoCuentaId });
  }

  cambiarEstadoCuenta(id: number, estado: EstadoCuenta): Observable<Cuenta> {
    return this.http.patch<Cuenta>(`${API}/cuentas/${id}/estado`, { estado });
  }

  depositar(cuentaId: number, monto: number, descripcion: string): Observable<{ movimiento: Movimiento }> {
    return this.http.post<{ movimiento: Movimiento }>(`${API}/depositos`, { cuentaId, monto, descripcion });
  }

  retirar(cuentaId: number, monto: number, descripcion: string): Observable<{ movimiento: Movimiento }> {
    return this.http.post<{ movimiento: Movimiento }>(`${API}/retiros`, { cuentaId, monto, descripcion });
  }

  transferir(cuentaOrigenId: number, cuentaDestinoId: number, monto: number, concepto: string): Observable<ResultadoTransferencia> {
    return this.http.post<ResultadoTransferencia>(`${API}/transferencias`, { cuentaOrigenId, cuentaDestinoId, monto, concepto });
  }

  movimientos(filtros: { cuentaId?: number | null; tipo?: string; desde?: string; hasta?: string }): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${API}/movimientos`, { params: parametros(filtros) });
  }

  consultar(q: string): Observable<Consulta> {
    return this.http.get<Consulta>(`${API}/consultas`, { params: parametros({ q }) });
  }

  reporte(desde = '', hasta = ''): Observable<Reporte> {
    return this.http.get<Reporte>(`${API}/reportes/operaciones`, { params: parametros({ desde, hasta }) });
  }
}
