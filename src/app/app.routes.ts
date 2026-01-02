import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { staffGuard } from './core/guards/staff.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent)
  },
  {
    path: 'rankings',
    loadComponent: () => import('./pages/rankings/rankings').then(m => m.RankingsComponent)
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery').then(m => m.GalleryComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'registro-exitoso',
    loadComponent: () => import('./pages/registro-exitoso/registro-exitoso').then(m => m.RegistroExitosoComponent)
  },
  {
    path: 'foro',
    loadComponent: () => import('./pages/foro/foro').then(m => m.ForoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tienda',
    loadComponent: () => import('./pages/tienda/tienda').then(m => m.TiendaComponent)
  },
  {
    path: 'descargas',
    loadComponent: () => import('./pages/downloads/downloads').then(m => m.DownloadsComponent)
  },
  // ============================================================================
  // ADMIN PANEL - Solo accesible para staff
  // ============================================================================
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [staffGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/users').then(m => m.UsersComponent)
      },
      {
        path: 'posts',
        loadComponent: () => import('./pages/admin/posts/posts').then(m => m.PostsComponent)
      },
      {
        path: 'gallery',
        loadComponent: () => import('./pages/admin/gallery/gallery').then(m => m.AdminGalleryComponent)
      },
      {
        path: 'content',
        loadComponent: () => import('./pages/admin/content/content').then(m => m.ContentComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/admin/products/products').then(m => m.ProductsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

