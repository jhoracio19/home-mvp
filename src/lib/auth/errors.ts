const MENSAJES: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'User already registered': 'Ya existe una cuenta con ese correo.',
  'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
  'Password should be at least 6 characters.': 'La contraseña debe tener al menos 6 caracteres.',
};

export function mensajeErrorAuth(message: string): string {
  return MENSAJES[message] ?? message;
}
