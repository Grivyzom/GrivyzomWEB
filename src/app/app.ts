import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './core/components/navbar/navbar';
import { NotificationBar } from './core/components/notification-bar/notification-bar';
import { Footer } from './core/components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, NotificationBar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('grivyzom-web');
}
