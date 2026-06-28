import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/application/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'sivet';

  // Instancia el ThemeService en el arranque (en cualquier ruta) para que la
  // preferencia de modo oscuro persistida se aplique globalmente tras un F5.
  private readonly theme = inject(ThemeService);
}
