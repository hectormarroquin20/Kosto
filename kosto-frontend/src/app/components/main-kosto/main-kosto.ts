import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-main-kosto',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './main-kosto.html',
  styleUrls: ['./main-kosto.scss']
})
export class MainKostoComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}