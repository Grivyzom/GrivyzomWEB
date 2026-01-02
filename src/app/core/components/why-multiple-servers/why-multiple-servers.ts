import { Component, Input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface ServerTypeInfo {
  label: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-why-multiple-servers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-multiple-servers.html',
  styleUrls: ['./why-multiple-servers.css'],
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: '0', opacity: 0 }))
      ])
    ])
  ]
})
export class WhyMultipleServersComponent {
  @Input() isStandalone: boolean = false;

  // Estado reactivo con signals
  readonly isExpanded = signal(false);

  constructor() {
    // Si es standalone (dentro de modal), expandir automáticamente
    effect(() => {
      if (this.isStandalone) {
        this.isExpanded.set(true);
      }
    });
  }

  // Información de tipos de servidores
  readonly serverTypes = signal<ServerTypeInfo[]>([
    {
      label: 'Classic',
      description: 'Se encuentran todos los servidores de tipo clásico network.',
      icon: '🎮',
      color: '#4a9eff'
    },
    {
      label: 'Play',
      description: 'Se encuentra nuestra nueva propuesta de distribución de servidores.',
      icon: '🎯',
      color: '#ff6b6b'
    },
    {
      label: 'Bedrock',
      description: 'Se encuentran dirigidos a la network compatible con bedrock.',
      icon: '🧱',
      color: '#51cf66'
    }
  ]);

  // Computed para el ícono del botón
  readonly toggleIcon = computed(() => this.isExpanded() ? '▲' : '▼');

  /**
   * Alterna el estado de expansión
   */
  toggleExpand(): void {
    this.isExpanded.update(value => !value);
  }

  /**
   * Expande el panel
   */
  expand(): void {
    this.isExpanded.set(true);
  }

  /**
   * Colapsa el panel
   */
  collapse(): void {
    this.isExpanded.set(false);
  }
}