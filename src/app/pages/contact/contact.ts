import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../core/services/contact';
import { AnimatedButton } from '../../core/components/animated-button/animated-button';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule, AnimatedButton],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent {
  private contactService = inject(ContactService);
  successMessage: string | null = null;
  errorMessage: string | null = null;

  onSubmit(contactForm: NgForm) {
    if (contactForm.valid) {
      this.contactService.sendContactForm(contactForm.value).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.errorMessage = null;
          contactForm.reset();
        },
        error: (error) => {
          if (error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Ocurrió un error al enviar el mensaje.';
          }
          this.successMessage = null;
          console.error(error);
        }
      });
    }
  }
}
