import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminHeaderComponent } from '../../../core/components/admin-header/admin-header';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, AdminHeaderComponent],
  template: `
    <div class="admin-page">
      <app-admin-header 
        title="Gestión de Posts" 
        subtitle="Moderar y gestionar publicaciones de la comunidad"
        [breadcrumbs]="[{label: 'Admin', route: '/admin'}, {label: 'Posts'}]">
      </app-admin-header>
      <div class="page-content">
        <div class="placeholder">
          <div class="placeholder-icon">📝</div>
          <h3>Gestión de Posts</h3>
          <p>Esta sección se implementará en la Fase 3</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { display: flex; flex-direction: column; min-height: 100%; }
    .page-content { flex: 1; padding: 24px 32px; }
    .placeholder { 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 80px 20px; text-align: center;
      background: #ffffff; border-radius: 16px; 
      border: 2px dashed rgba(138, 116, 249, 0.25);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .placeholder-icon { font-size: 48px; margin-bottom: 16px; }
    .placeholder h3 { 
      font-family: 'Inter', sans-serif; font-weight: 700; 
      color: #2d3748; margin: 0 0 8px; font-size: 20px;
    }
    .placeholder p { 
      font-family: 'Inter', sans-serif; font-weight: 500;
      color: #718096; margin: 0; font-size: 14px;
    }
  `]
})
export class PostsComponent { }
