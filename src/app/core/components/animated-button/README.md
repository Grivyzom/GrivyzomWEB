# AnimatedButton - Componente Reutilizable

Un botón animado con efectos visuales de bordes y relleno que se activan al pasar el mouse.

## 🎨 Características

- ✨ Animación de bordes que se expanden
- 🎭 Relleno de color progresivo
- 🌈 Overlay con gradiente
- 🎯 Completamente personalizable
- 📱 Responsive
- ♿ Soporte para estado deshabilitado
- 🧩 Fácil de integrar

## 📦 Instalación

El componente ya está creado en `src/app/core/components/animated-button/`

## 🚀 Uso Básico

### 1. Importar en tu componente

```typescript
import { AnimatedButton } from '../animated-button/animated-button';

@Component({
  selector: 'app-tu-componente',
  imports: [AnimatedButton],
  // ...
})
```

### 2. Usar en el template

```html
<!-- Botón básico con texto -->
<app-animated-button
  label="Botón Animado"
  (buttonClick)="tuFuncion()">
</app-animated-button>

<!-- Botón con icono -->
<app-animated-button
  label="Copiar IP"
  icon="ci ci-Copy"
  title="Copiar IP del servidor"
  (buttonClick)="copyIP()">
</app-animated-button>

<!-- Botón deshabilitado -->
<app-animated-button
  label="Deshabilitado"
  [disabled]="true">
</app-animated-button>
```

## 📝 Propiedades (Inputs)

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `label` | `string` | `'Button'` | Texto del botón |
| `icon` | `string` | `''` | Clase del icono (ej: 'ci ci-Copy') |
| `title` | `string` | `''` | Tooltip del botón |
| `disabled` | `boolean` | `false` | Estado deshabilitado |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo de botón HTML |

## 🎯 Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `buttonClick` | `EventEmitter<MouseEvent>` | Se emite cuando se hace clic en el botón |

## 🎨 Variantes de Tamaño (CSS)

Puedes agregar clases CSS adicionales para modificar el tamaño:

```html
<!-- Botón pequeño -->
<app-animated-button
  class="btn-sm"
  label="Pequeño">
</app-animated-button>

<!-- Botón grande -->
<app-animated-button
  class="btn-lg"
  label="Grande">
</app-animated-button>

<!-- Solo icono -->
<app-animated-button
  class="btn-icon-only"
  icon="ci ci-Settings">
</app-animated-button>
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Botón de Copiar

```typescript
// En tu componente
copyToClipboard() {
  navigator.clipboard.writeText('Texto a copiar')
    .then(() => console.log('Copiado!'))
    .catch(err => console.error('Error:', err));
}
```

```html
<app-animated-button
  label="Copiar"
  icon="ci ci-Copy"
  (buttonClick)="copyToClipboard()">
</app-animated-button>
```

### Ejemplo 2: Botón de Envío de Formulario

```html
<form (submit)="submitForm()">
  <!-- Campos del formulario -->
  
  <app-animated-button
    type="submit"
    label="Enviar Formulario"
    icon="ci ci-Send"
    [disabled]="!form.valid">
  </app-animated-button>
</form>
```

### Ejemplo 3: Botón con Estado Dinámico

```typescript
// En tu componente
isLoading = signal(false);

async handleAction() {
  this.isLoading.set(true);
  try {
    await someAsyncOperation();
  } finally {
    this.isLoading.set(false);
  }
}
```

```html
<app-animated-button
  [label]="isLoading() ? 'Cargando...' : 'Procesar'"
  icon="ci ci-Refresh"
  [disabled]="isLoading()"
  (buttonClick)="handleAction()">
</app-animated-button>
```

## 🎨 Personalización de Colores

Si quieres cambiar los colores del efecto, edita el archivo `animated-button.css`:

```css
/* Cambiar color de los bordes */
.border-top, .border-bottom {
  border-color: tu-color;
}

/* Cambiar color del relleno */
.fill-animation {
  background: tu-color-con-opacidad;
}

/* Cambiar gradiente del overlay */
.overlay-animation {
  background: linear-gradient(135deg, color1, color2);
}
```

## 🔧 Configuración de Animación

Para ajustar la velocidad de las animaciones, modifica las duraciones en `animated-button.css`:

```css
/* Velocidad de bordes (default: 0.2s) */
.border-animation {
  transition: all 0.2s ease;
}

/* Velocidad de relleno (default: 0.3s con delay 0.2s) */
.fill-animation {
  transition: all 0.3s ease 0.2s;
}

/* Velocidad de overlay (default: 0.3s con delay 0.3s) */
.overlay-animation {
  transition: opacity 0.3s ease 0.3s;
}
```

## 📱 Soporte Responsive

El componente es completamente responsive y se adapta a:
- Desktop (>768px)
- Tablets (481px - 768px)
- Móviles (≤480px)

## ♿ Accesibilidad

El componente incluye:
- Soporte para `title` (tooltip)
- Estado `disabled` manejado correctamente
- Eventos de teclado nativos del botón HTML

## 🧪 Testing

El componente incluye tests básicos en `animated-button.spec.ts`:

```bash
# Ejecutar tests
ng test
```

## 📄 Licencia

Este componente es parte del proyecto Grivyzom.

---

**Creado con ❤️ para el proyecto Grivyzom**
