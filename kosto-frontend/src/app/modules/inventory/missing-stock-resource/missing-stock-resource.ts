import { Component, inject, signal } from '@angular/core';
import { ResourceService } from '../../../core/services/resource.service';
import { ResourceModel } from '../../../core/models/resource.interface';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { AddStockResourceDialog } from '../add-resource-stock-dialog/add-stock-dialog';

import { TenantService } from '../../../core/services/tenant.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IAuthService } from '@/core/models/auth.interface';

@Component({
  selector: 'app-missing-stock-resource',
  imports: [
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TranslatePipe,
    MatTooltipModule
  ],
  templateUrl: './missing-stock-resource.html',
  styleUrl: './missing-stock-resource.scss',
})
export class MissingStockResource {
  private readonly resourcesService = inject(ResourceService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(IAuthService);
  public tenantService = inject(TenantService); // Add this

  // Reactive state using Signals
  public missingResourceStock = signal<ResourceModel[]>([]);
  public isLoading = signal<boolean>(true);
  public isBusinessTier = signal<boolean>(false); // Start false (disabled)

  // Columns to display in the table
  public displayedColumns: string[] = ['name', 'unit_cost', 'stock', 'unit_measure', 'updated_at', 'actions'];
  private tenantId: string | null = null;

  ngOnInit() {
    this.tenantId = this.authService.getTenantId();
    if (this.tenantId) {
      // Just fetch and update the service's signal
      this.tenantService.getTenantbyId(this.tenantId).subscribe({
        next: (response: any) => {
          const tenant = response.data[0];
          this.isBusinessTier.set(tenant?.tier === 'business');
        },
        error: (err) => {
          console.error('Error fetching tenant:', err);
          this.isBusinessTier.set(false); // Ensure it's disabled on error
        }
      });
    }
    this.loadMissingStockResources();
  }

  loadMissingStockResources() {
    this.isLoading.set(true);

    this.resourcesService.getResources().subscribe({
      next: (response: any) => {
        // Filter resources with zero stock
        const zeroStockResources = response.data.filter((resource: ResourceModel) => resource.current_stock === 0);
        this.missingResourceStock.set(zeroStockResources);
        this.isLoading.set(false);

      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading inventory:', err)
      }
    });
  }

  onEdit(resource: ResourceModel) {
    // Navigate to the form passing the object (you can use a QueryParam or a state service)
    this.router.navigate(['/resources/edit', resource.id]);
  }

  openAddStockDialog(resource: ResourceModel) {
    const dialogRef = this.dialog.open(AddStockResourceDialog, {
      width: '420px',
      disableClose: true,
      data: resource
    });

    dialogRef.afterClosed().subscribe((updated: boolean) => {
      if (updated) {
        this.loadMissingStockResources();
      }
    });
  }

  exportData() {
    console.log('Export logic placeholder for Business Tier');
    // We will implement the actual file generation in the next phase
  }
}

