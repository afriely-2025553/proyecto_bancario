import { z } from 'zod';
import { ErrorApp } from './errores';

/** Valida el cuerpo de la petición con un esquema de zod o responde 400 con el primer problema. */
export function leerCuerpo<T>(esquema: z.ZodType<T>, cuerpo: unknown): T {
  const resultado = esquema.safeParse(cuerpo ?? {});
  if (!resultado.success) {
    const mensaje = resultado.error.issues[0]?.message || 'Los datos no son válidos.';
    throw new ErrorApp(400, mensaje, 'DATOS_INVALIDOS');
  }
  return resultado.data;
}

const textoOpcional = (max: number, etiqueta: string) =>
  z
    .string()
    .trim()
    .max(max, `${etiqueta} admite como máximo ${max} caracteres.`)
    .nullish()
    .transform((valor) => (valor ? valor : null));

export const esquemaCliente = z.object({
  identificacion: z
    .string({ error: 'La identificación es obligatoria.' })
    .trim()
    .min(5, 'La identificación debe tener al menos 5 caracteres.')
    .max(30, 'La identificación admite como máximo 30 caracteres.')
    .regex(/^[A-Za-z0-9-]+$/, 'La identificación solo admite letras, números y guion.'),
  nombres: z
    .string({ error: 'Los nombres son obligatorios.' })
    .trim()
    .min(2, 'Los nombres deben tener al menos 2 caracteres.')
    .max(80, 'Los nombres admiten como máximo 80 caracteres.'),
  apellidos: z
    .string({ error: 'Los apellidos son obligatorios.' })
    .trim()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres.')
    .max(80, 'Los apellidos admiten como máximo 80 caracteres.'),
  fechaNacimiento: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe usar el formato AAAA-MM-DD.'), z.literal('')])
    .nullish()
    .transform((valor) => (valor ? valor : null)),
  telefono: textoOpcional(20, 'El teléfono'),
  correo: z
    .string({ error: 'El correo es obligatorio.' })
    .trim()
    .toLowerCase()
    .max(150, 'El correo admite como máximo 150 caracteres.')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo no es válido.'),
  direccion: textoOpcional(255, 'La dirección'),
});

export type DatosCliente = z.infer<typeof esquemaCliente>;

export const esquemaCuentaNueva = z.object({
  clienteId: z.number({ error: 'El cliente es obligatorio.' }).int().positive('El cliente es obligatorio.'),
  tipoCuentaId: z.number({ error: 'El tipo de cuenta es obligatorio.' }).int().positive('El tipo de cuenta es obligatorio.'),
});

export const esquemaEstadoCuenta = z.object({
    estado: z.enum(['activa', 'inactiva'], { error: 'El estado debe ser «activa» o «inactiva».' }),
  });
  
  /** Valida un monto y lo devuelve como texto con dos decimales ("15.50") */
  export function leerMonto(valor: unknown): string {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      throw new ErrorApp(400, 'El monto debe ser un número.', 'MONTO_INVALIDO');
    }
    if (valor <= 0) {
      throw new ErrorApp(400, 'El monto debe ser mayor que cero.', 'MONTO_NO_POSITIVO');
    }
    const centavos = Math.round(valor * 100);
    if (Math.abs(valor * 100 - centavos) > 1e-6) {
      throw new ErrorApp(400, 'El monto admite como máximo dos decimales.', 'MONTO_DECIMALES');
    }
    if (centavos > 100_000_000) {
      throw new ErrorApp(400, 'El monto supera el límite por operación de Q 1,000,000.00.', 'MONTO_LIMITE');
    }
    return (centavos / 100).toFixed(2);
  }
  
  const descripcionOpcional = z.string().trim().max(255, 'La descripción admite como máximo 255 caracteres.').nullish();
  
  export const esquemaOperacion = z.object({
    cuentaId: z.number({ error: 'La cuenta es obligatoria.' }).int().positive('La cuenta es obligatoria.'),
    monto: z.unknown(),
    descripcion: descripcionOpcional,
  });
  
  export const esquemaTransferencia = z.object({
    cuentaOrigenId: z.number({ error: 'La cuenta origen es obligatoria.' }).int().positive('La cuenta origen es obligatoria.'),
    cuentaDestinoId: z.number({ error: 'La cuenta destino es obligatoria.' }).int().positive('La cuenta destino es obligatoria.'),
    monto: z.unknown(),
    concepto: z.string().trim().max(255, 'El concepto admite como máximo 255 caracteres.').nullish(),
  });  
  
  export const esquemaLogin = z.object({
    nombreUsuario: z.string({ error: 'El usuario es obligatorio.' }).trim().min(1, 'El usuario es obligatorio.'),
    contrasena: z.string({ error: 'La contraseña es obligatoria.' }).min(1, 'La contraseña es obligatoria.'),
  });
  
