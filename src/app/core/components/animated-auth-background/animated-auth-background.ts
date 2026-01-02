import { Component, ChangeDetectionStrategy, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-auth-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-auth-background.html',
  styleUrls: ['./animated-auth-background.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AnimatedAuthBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('interactiveSvg', { static: false }) svgElement?: ElementRef<SVGSVGElement>;

  private mouseX = 0;
  private mouseY = 0;
  private animationFrameId?: number;
  private boundMouseMove?: (e: MouseEvent) => void;
  private isDestroyed = false;

  ngOnInit(): void {
    this.boundMouseMove = this.onMouseMove.bind(this);
    window.addEventListener('mousemove', this.boundMouseMove, { passive: true });
  }

  ngAfterViewInit(): void {
    // Usar setTimeout para asegurar que el DOM esté listo
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.startAnimation();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;

    // Cancelar animación INMEDIATAMENTE
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }

    // Limpiar event listener
    if (this.boundMouseMove) {
      window.removeEventListener('mousemove', this.boundMouseMove);
      this.boundMouseMove = undefined;
    }

    // Pausar todas las animaciones SVG para liberar recursos
    if (this.svgElement?.nativeElement) {
      try {
        const svg = this.svgElement.nativeElement;
        // Pausar todas las animaciones SVG
        svg.pauseAnimations();

        // Limpiar referencias
        const animations = svg.querySelectorAll('animate, animateTransform');
        animations.forEach(anim => {
          (anim as SVGAnimateElement).endElement();
        });
      } catch (error) {
        // Silenciar errores de limpieza
      }
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDestroyed) {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    }
  }

  private startAnimation(): void {
    if (!this.svgElement?.nativeElement || this.isDestroyed) {
      return;
    }

    const svg = this.svgElement.nativeElement;
    const interactiveCircle = svg.querySelector('.interactive-cursor-circle') as SVGCircleElement;
    const gradientFollow = svg.querySelector('#gradientFollow stop:first-child') as SVGStopElement;

    const animate = () => {
      // Verificar que el componente no esté destruido
      if (this.isDestroyed) {
        return;
      }

      try {
        if (interactiveCircle && svg) {
          // Convertir coordenadas del mouse a coordenadas del SVG
          const rect = svg.getBoundingClientRect();

          // Verificar que rect tenga valores válidos
          if (rect.width > 0 && rect.height > 0) {
            const svgX = ((this.mouseX - rect.left) / rect.width) * 1920;
            const svgY = ((this.mouseY - rect.top) / rect.height) * 1080;

            // Actualizar posición del círculo interactivo
            interactiveCircle.setAttribute('cx', svgX.toString());
            interactiveCircle.setAttribute('cy', svgY.toString());
          }
        }

        if (gradientFollow && window.innerWidth > 0 && window.innerHeight > 0) {
          // Mover el gradiente según el cursor
          const percentX = (this.mouseX / window.innerWidth) * 100;
          const percentY = (this.mouseY / window.innerHeight) * 100;
          gradientFollow.setAttribute('offset', `${Math.min(percentX, 100)}%`);
        }
      } catch (error) {
        // Silenciar errores para evitar bloqueos
        console.warn('AnimatedAuthBackground animation error:', error);
      }

      // Solo continuar si el componente no está destruido
      if (!this.isDestroyed) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();
  }
}
