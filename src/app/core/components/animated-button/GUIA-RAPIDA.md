# 🎯 GUÍA RÁPIDA - AnimatedButton Component

## 📦 Archivos Creados

```
src/app/core/components/animated-button/
├── animated-button.ts          # Componente TypeScript
├── animated-button.html        # Template HTML
├── animated-button.css         # Estilos CSS
├── animated-button.spec.ts     # Tests unitarios
├── README.md                   # Documentación completa
├── EJEMPLOS.html              # 20+ ejemplos de uso
└── GUIA-RAPIDA.md             # Este archivo
```

## ⚡ Uso en 3 Pasos

### 1️⃣ Importar el componente

```typescript
import { AnimatedButton } from '../animated-button/animated-button';

@Component({
  selector: 'app-tu-componente',
  imports: [AnimatedButton],
  // ...
})
```

### 2️⃣ Usar en el template

```html
<app-animated-button
  label="Texto del Botón"
  icon="ci ci-Copy"
  (buttonClick)="tuFuncion()">
</app-animated-button>
```

### 3️⃣ Implementar la función

```typescript
tuFuncion() {
  console.log('¡Botón clickeado!');
  // Tu lógica aquí
}
```

## 🎨 Opciones Comunes

```html
<!-- Con icono -->
<app-animated-button
  label="Copiar"
  icon="ci ci-Copy">
</app-animated-button>

<!-- Deshabilitado -->
<app-animated-button
  label="No Disponible"
  [disabled]="true">
</app-animated-button>

<!-- Botón de submit -->
<app-animated-button
  label="Enviar"
  type="submit">
</app-animated-button>

<!-- Tamaño pequeño -->
<app-animated-button
  class="btn-sm"
  label="Pequeño">
</app-animated-button>

<!-- Tamaño grande -->
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

## 📋 Propiedades Principales

| Propiedad | Tipo | Ejemplo |
|-----------|------|---------|
| `label` | string | `"Copiar IP"` |
| `icon` | string | `"ci ci-Copy"` |
| `title` | string | `"Copiar al portapapeles"` |
| `disabled` | boolean | `[disabled]="true"` |
| `type` | string | `"submit"` / `"button"` / `"reset"` |
| `(buttonClick)` | EventEmitter | `(buttonClick)="miFuncion()"` |

## 🎯 Iconos Disponibles (Coolicons)

Algunos iconos comunes que puedes usar:

```html
icon="ci ci-Copy"          <!-- Copiar -->
icon="ci ci-Save"          <!-- Guardar -->
icon="ci ci-Download"      <!-- Descargar -->
icon="ci ci-Send"          <!-- Enviar -->
icon="ci ci-Edit"          <!-- Editar -->
icon="ci ci-Trash"         <!-- Eliminar -->
icon="ci ci-Search"        <!-- Buscar -->
icon="ci ci-Settings"      <!-- Configuración -->
icon="ci ci-User_Circle"   <!-- Usuario -->
icon="ci ci-Check"         <!-- Verificar -->
icon="ci ci-Close"         <!-- Cerrar -->
icon="ci ci-Star"          <!-- Estrella -->
icon="ci ci-Help"          <!-- Ayuda -->
icon="ci ci-Notification"  <!-- Notificación -->
```

## 💡 Ejemplos Prácticos

### Ejemplo 1: Copiar al Portapapeles

```typescript
copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => console.log('¡Copiado!'))
    .catch(err => console.error('Error:', err));
}
```

```html
<app-animated-button
  label="Copiar IP"
  icon="ci ci-Copy"
  (buttonClick)="copyToClipboard('192.168.1.1')">
</app-animated-button>
```

### Ejemplo 2: Con Estado de Carga

```typescript
isLoading = signal(false);

async loadData() {
  this.isLoading.set(true);
  try {
    await fetch('api/data');
  } finally {
    this.isLoading.set(false);
  }
}
```

```html
<app-animated-button
  [label]="isLoading() ? 'Cargando...' : 'Cargar Datos'"
  [disabled]="isLoading()"
  (buttonClick)="loadData()">
</app-animated-button>
```

### Ejemplo 3: Navegación con Router

```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

goToPage() {
  this.router.navigate(['/dashboard']);
}
```

```html
<app-animated-button
  label="Ir al Dashboard"
  icon="ci ci-Dashboard"
  (buttonClick)="goToPage()">
</app-animated-button>
```

## 🎨 Personalización de Colores

Edita `animated-button.css` para cambiar los colores:

```css
/* Bordes */
.border-top, .border-bottom {
  border-color: #tu-color;
}

/* Relleno */
.fill-animation {
  background: rgba(tu-r, tu-g, tu-b, 0.8);
}

/* Gradiente */
.overlay-animation {
  background: linear-gradient(135deg, #color1, #color2);
}
```

## 🚀 Integración Actual

Ya está integrado en:
- ✅ Navbar (botón "Copiar IP")

Próximas integraciones sugeridas:
- 🔲 Footer
- 🔲 Formularios
- 🔲 Modales
- 🔲 Cards de acciones

## 📚 Recursos

- **Documentación completa:** `README.md`
- **Ejemplos variados:** `EJEMPLOS.html`
- **Tests:** `animated-button.spec.ts`

## 🐛 Solución de Problemas

### El botón no se muestra
✅ Verifica que importaste el componente en tu módulo/componente

### El icono no aparece
✅ Asegúrate de que Coolicons esté cargado en tu proyecto
✅ Verifica que la clase del icono sea correcta (ej: "ci ci-Copy")

### La animación no funciona
✅ Verifica que los estilos CSS estén cargados
✅ Comprueba que no haya estilos conflictivos

### El click no funciona
✅ Asegúrate de usar `(buttonClick)` no `(click)`
✅ Verifica que el botón no esté `disabled`

## 🎓 Mejores Prácticas

1. ✅ Usa nombres descriptivos para `label`
2. ✅ Siempre incluye un `title` para accesibilidad
3. ✅ Usa iconos apropiados para cada acción
4. ✅ Maneja estados de carga con `disabled`
5. ✅ Agrupa botones relacionados visualmente

---

**¿Necesitas más ayuda?** Consulta `README.md` o `EJEMPLOS.html`
