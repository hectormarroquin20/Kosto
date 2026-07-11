import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-form-kosto',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './form-kosto.html'
})
export class FormKostoComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() maxWidth: string = '900px';
}