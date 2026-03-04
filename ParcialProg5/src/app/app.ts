import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListpaisesComponent } from './components/listpaises/listpaises.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ListpaisesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Final Programacion 5';
}
