import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        response => {
          // Handle response based on success or failure
          if (response.message === 'Connexion réussie') {
            this.router.navigate(['/formation']); // Navigate to success page or route
          } else {
            this.errorMessage = 'Identifiants incorrects'; // Display error message
          }
        },
        error => {
          this.errorMessage = 'An error occurred. Please try again.'; // Handle HTTP error
        }
      );
    }
  }
}
