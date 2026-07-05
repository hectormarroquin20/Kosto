import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IAuthService } from '../../../core/models/auth.interface';
import { Router, RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { LanguageSelector } from '../language-selector/language-selector';


// @Component({
//   selector: 'app-login',
//   imports: [
//     ReactiveFormsModule, // 2. IMPORTANT FOR [formGroup]
//     MatCardModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatIconModule,
//     TranslatePipe
//   ],
//   templateUrl: './login.html',
//   styleUrl: './login.scss',
// })
// export class Login {
//   private fb = inject(FormBuilder);
//   private authService = inject(Auth); // Inject the service
//   private router = inject(Router);

//   // 3. THIS IS WHAT YOU NEED IN THE COMPONENT
//   loginForm: FormGroup = this.fb.group({
//     email: ['', [Validators.required, Validators.email]],
//     password: ['', [Validators.required]]
//   });

//   hidePassword = signal(true);

//   togglePassword() {
//     this.hidePassword.set(!this.hidePassword());
//   }

//   onLogin() {
//     if (this.loginForm.valid) {
//       const { email } = this.loginForm.value;

//       // 1. Execute the login logic
//       this.authService.login(email);

//       // 2. Redirect to home/dashboard
//       this.router.navigate(['/']);
//     }
//   }
// }

@Component({
  selector: 'app-login',
  standalone: true, // Ensure it is standalone
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    LanguageSelector
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private oidcSecurityService = inject(OidcSecurityService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  hidePassword = signal(true);

  togglePassword() {
    this.hidePassword.set(!this.hidePassword());
  }

  onLogin() {
    // This is the most basic and secure way
    this.oidcSecurityService.authorize();
  }
}
