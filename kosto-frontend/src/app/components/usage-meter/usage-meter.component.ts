import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-usage-meter',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="meter-container">
      <div class="label">{{ label }}</div>
      <div class="progress-bg">
        <div class="progress-fill" [style.width.%]="percentage()"></div>
      </div>
      <div class="stats">{{ current }} / {{ limit === infinity ? '∞' : limit }}</div>
    </div>
  `,
    styles: [`
    .meter-container { margin: 10px 0; }
    .progress-bg { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: #3f51b5; transition: width 0.3s; }
  `]
})
export class UsageMeterComponent {
    @Input() label: string = '';
    @Input() current: number = 0;
    @Input() limit: number = 0;

    // Expose this so the template can see it
    readonly infinity = Infinity;

    percentage = computed(() => {
        if (this.limit === Infinity) return 100;
        if (this.limit === 0) return 0;
        return Math.min((this.current / this.limit) * 100, 100);
    });
}

