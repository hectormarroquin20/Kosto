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
//     ReactiveFormsModule, // 2. IMPORTANTE para [formGroup]
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
//   private authService = inject(Auth); // Inyectamos el servicio
//   private router = inject(Router);

//   // 3. ESTO ES LO QUE TE FALTA EN EL COMPONENTE
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

//       // 1. Ejecutamos la lógica de login
//       this.authService.login(email);

//       // 2. Redirigimos al home/dashboard
//       this.router.navigate(['/']);
//     }
//   }
// }

// import { Component, inject, signal } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCardModule } from '@angular/material/card';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
// import { MatInputModule } from '@angular/material/input';
// import { Router } from '@angular/router';
// import { TranslatePipe } from '@ngx-translate/core';
// // Importa el servicio de OIDC
// import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-login',
  standalone: true, // Asegúrate de que sea standalone
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
    // Esto es la forma más básica y segura
    this.oidcSecurityService.authorize();
  }
}
