import { Component } from '@angular/core';
import { ScrollComponent } from '../components/scroll/scroll.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ScrollComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
