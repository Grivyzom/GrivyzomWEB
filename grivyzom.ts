export interface Servidor {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'activo' | 'mantenimiento' | 'inactivo';
  jugadores: number;
  capacidadMax: number;
  precio?: number;
}

export interface Usuario {
  id: string;
  nombre: string;
  avatar: string;
  rol: 'admin' | 'moderador' | 'jugador';
}

export interface Tema {
  modo: 'claro' | 'oscuro';
}

export interface MenuItem {
  etiqueta: string;
  ruta: string;
  icono?: string;
}