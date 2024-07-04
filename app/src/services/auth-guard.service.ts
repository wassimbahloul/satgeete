import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './login.service';



@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): boolean {
    if (this.loginService.isAuthenticated()) {
      return true;
    } else {
      // L'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion
      this.router.navigate(['/']);
      return false;
    }
  }
}
