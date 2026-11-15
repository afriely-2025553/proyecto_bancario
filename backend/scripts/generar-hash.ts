import bcrypt from 'bcryptjs';

const contrasena = process.argv[2];
if (!contrasena) {
  console.error('Uso: pnpm hash "Contraseña"');
  process.exit(1);
}
console.log(bcrypt.hashSync(contrasena, 10));
