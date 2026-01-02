import { Component, ChangeDetectionStrategy, input, output, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroService } from '../../services/hero.service'; // Import the new service

export interface HeroButton {
  text: string;
  action?: () => void;
  url?: string;
  icon?: string;
}

export interface HeroSlide {
  backgroundImage: string;
  title: string;
  subtitle: string;
  button?: HeroButton;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule], // Remove HttpClientModule
  templateUrl: './hero-section.html',
  styleUrls: ['./hero-section.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  // Inputs configurables por el cliente
  slides = input<HeroSlide[]>([]);
  autoPlay = input<boolean>(true);
  autoPlayInterval = input<number>(5000);

  // Estado interno para los slides que pueden venir de la API
  protected apiSlides = signal<HeroSlide[]>([]);

  // Estadísticas opcionales
  usersOnline = input<string>();
  totalUsers = input<string>();
  showStats = input<boolean>(false);

  // Output para eventos del botón
  buttonClick = output<void>();
  slideChange = output<number>();

  // Estado del slider
  protected currentSlideIndex = signal(0);
  private autoPlayTimer?: number;


  /**
   * Returns the currently active set of slides, prioritizing API data over input data.
   */
  protected get activeSlides(): HeroSlide[] {
    return this.apiSlides().length > 0 ? this.apiSlides() : this.slides();
  }

  constructor(private heroService: HeroService) { // Inject HeroService
    // Effect para reiniciar autoplay cuando cambian los slides
    effect(() => {
      if (this.activeSlides.length > 0) {
        this.setupAutoPlay();
      }
    });
  }

  ngOnInit(): void {
    this.heroService.getHeroSectionData().subscribe({
      next: (data) => {
        // Assuming the backend returns a single hero section, we convert it to a slide
        this.apiSlides.set([{
          backgroundImage: data.image_url,
          title: data.title,
          subtitle: data.description,
          // You can add default button config here if needed
          button: {
            text: 'Más información', // Default button text
            url: '#' // Default URL or fetch from backend if available
          }
        }]);
        this.setupAutoPlay(); // Re-setup autoplay with fetched data
      },
      error: (error) => {
        console.error('Error fetching hero section data:', error);
        // Fallback to input slides if API fails
        if (this.slides().length === 0) {
          this.apiSlides.set([{
            backgroundImage: '/assets/img/placeholder.svg',
            title: 'Título del Hero (Fallback)',
            subtitle: 'Subtítulo descriptivo (Fallback)'
          }]);
        }
      }
    });
    this.setupAutoPlay();
  }

  ngOnDestroy(): void {
    this.clearAutoPlay();
  }

  /**
   * Obtiene el slide actual
   */
  protected getCurrentSlide(): HeroSlide {
    const slidesData = this.apiSlides().length > 0 ? this.apiSlides() : this.slides();
    if (slidesData.length === 0) {
      return {
        backgroundImage: '/assets/img/placeholder.svg',
        title: 'Título del Hero',
        subtitle: 'Subtítulo descriptivo'
      };
    }
    return slidesData[this.currentSlideIndex()];
  }

  /**
   * Navega al siguiente slide
   */
  protected nextSlide(): void {
    if (this.activeSlides.length <= 1) return;

    const nextIndex = (this.currentSlideIndex() + 1) % this.activeSlides.length;
    this.goToSlide(nextIndex);
  }

  /**
   * Navega al slide anterior
   */
  protected prevSlide(): void {
    if (this.activeSlides.length <= 1) return;

    const prevIndex = this.currentSlideIndex() === 0
      ? this.activeSlides.length - 1
      : this.currentSlideIndex() - 1;
    this.goToSlide(prevIndex);
  }

  /**
   * Va a un slide específico
   */
  protected goToSlide(index: number): void {
    this.currentSlideIndex.set(index);
    this.slideChange.emit(index);
    this.resetAutoPlay();
  }

  /**
   * Maneja el click en el botón principal
   */
  protected onButtonClick(): void {
    const currentSlide = this.getCurrentSlide();
    const buttonConfig = currentSlide.button;

    if (!buttonConfig) return;

    if (buttonConfig.action) {
      buttonConfig.action();
    } else if (buttonConfig.url) {
      window.open(buttonConfig.url, '_blank', 'noopener,noreferrer');
    }

    this.buttonClick.emit();
  }

  /**
   * Configura el autoplay
   */
  private setupAutoPlay(): void {
    if (!this.autoPlay() || this.activeSlides.length <= 1) {
      return;
    }

    this.clearAutoPlay();
    this.autoPlayTimer = window.setInterval(() => {
      this.nextSlide();
    }, this.autoPlayInterval());
  }

  /**
   * Limpia el autoplay
   */
  private clearAutoPlay(): void {
    if (this.autoPlayTimer) {
      window.clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = undefined;
    }
  }

  /**
   * Reinicia el autoplay
   */
  private resetAutoPlay(): void {
    this.clearAutoPlay();
    this.setupAutoPlay();
  }

  /**
   * Maneja errores de carga de imágenes
   */
  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/img/placeholder.svg';
    console.warn('Error cargando imagen, usando placeholder:', img.src);
  }
}