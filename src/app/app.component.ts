import { Component } from '@angular/core';
import { ToastComponent } from './shared/toast';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterModule, ToastComponent, ToastComponent],
})
export class AppComponent {
  title = 'dessert';
}
