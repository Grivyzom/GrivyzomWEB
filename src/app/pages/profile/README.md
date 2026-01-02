# Perfil de Usuario - Grivyzom

## Descripción

Página de perfil profesional y moderna para usuarios de Grivyzom, con diseño responsive y animaciones suaves que mantienen la coherencia visual con el resto de la aplicación.

## Características

### 🎨 Diseño Visual

- **Estilo Consistente**: Mantiene la paleta de colores de Grivyzom (púrpura, azul, verde)
- **Animaciones Suaves**: Transiciones y efectos visuales fluidos
- **Responsive**: Se adapta perfectamente a desktop, tablet y móvil
- **Tarjeta de Perfil**: Header con banner degradado y avatar circular
- **Badges de Rol**: 13 tipos de roles con colores y efectos únicos

### 👤 Sección de Perfil

**Header Principal:**
- Avatar circular con efecto hover para cambiar foto
- Nombre de usuario destacado
- Badge de rol animado con gradiente
- Información del usuario (Minecraft, email, fecha de registro)
- Botón de cerrar sesión

**Información del Perfil:**
- Nombre de usuario
- Correo electrónico
- Nombre de Minecraft
- Usuario de Discord
- Biografía personal
- Modo edición con validación

### 🔒 Sección de Seguridad

- Cambio de contraseña
- Campos con visibilidad toggleable (mostrar/ocultar)
- Validación de requisitos de seguridad
- Confirmación de contraseña

### ⚙️ Sección de Preferencias

- Selector de zona horaria (400+ opciones)
- Notificaciones por email (toggle)
- Notificaciones del servidor (toggle)
- Switches personalizados con animación

## Roles y Badges

### Roles de Jugador
- **Default** - Gris: Usuarios nuevos
- **Usuario** - Azul: Usuarios registrados
- **Aprendiz** - Verde: Jugadores en entrenamiento
- **Miembro** - Índigo: Miembros establecidos
- **Veterano** - Amarillo: Jugadores experimentados
- **VIP** - Rosa: Miembros premium
- **VIP+** - Rojo brillante: Premium con beneficios extra
- **Streamer** - Púrpura: Creadores de contenido

### Roles de Staff
- **Helper** - Verde claro: Ayudantes
- **Builder** - Naranja: Constructores
- **Moderador** - Azul cielo: Moderadores
- **Admin** - Rojo: Administradores (con glow)
- **Developer** - Turquesa: Desarrolladores

## Componentes Utilizados

- **AnimatedButton**: Botones con animaciones
- **CommonModule**: Directivas de Angular
- **FormsModule**: Manejo de formularios
- **RouterModule**: Navegación
- **AuthService**: Gestión de autenticación

## Estados y Funcionalidades

### Estados Visuales
- ✅ Modo vista (campos deshabilitados)
- ✏️ Modo edición (campos habilitados)
- 💾 Estado de carga (loading)
- ✔️ Mensajes de éxito
- ❌ Mensajes de error

### Funcionalidades Interactivas
- **Tabs**: Navegación entre secciones
- **Avatar Upload**: Cambio de foto con preview
- **Password Toggle**: Mostrar/ocultar contraseñas
- **Form Validation**: Validación en tiempo real
- **Auto-save**: Guardar cambios automáticamente

## Responsive Design

### Desktop (> 768px)
- Layout en dos columnas para formularios
- Tabs horizontales
- Avatar de 140px

### Tablet (768px - 480px)
- Layout en una columna
- Tabs apilados
- Información centrada

### Mobile (< 480px)
- Avatar de 110px
- Tabs verticales completos
- Botones a ancho completo
- Texto reducido en badges

## Animaciones

1. **Fade In**: Entrada suave del contenedor
2. **Slide Down**: Animación de tarjetas
3. **Slide Up**: Navegación de tabs
4. **Pulse**: Efecto en badges de rol
5. **Hover Effects**: Transformaciones suaves
6. **Transitions**: 0.3s ease en todos los elementos

## Mejoras Futuras

- [ ] Integración completa con backend para actualizar datos
- [ ] Sistema de notificaciones en tiempo real
- [ ] Historial de actividad del usuario
- [ ] Estadísticas de juego
- [ ] Conexión con API de Minecraft para skin
- [ ] Galería de logros
- [ ] Configuración de privacidad
- [ ] Tema oscuro

## Notas Técnicas

- Usa señales de Angular para reactividad
- Avatar por defecto generado con SVG y iniciales
- Hash code para colores consistentes por usuario
- Validación de imágenes (máx 1MB, JPG/PNG/GIF)
- Formularios con two-way binding
- Guards de navegación (redirige a login si no autenticado)
