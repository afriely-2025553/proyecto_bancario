import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
})
export class Inicio {
  readonly auth = inject(AuthService);
}
