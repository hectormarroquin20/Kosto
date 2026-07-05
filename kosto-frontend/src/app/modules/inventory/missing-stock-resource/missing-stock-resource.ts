import { Component, inject, signal } from '@angular/core';
import { Resource } from '../../../core/services/resource';
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
import { AddStockResourceDialog } from '../add-stock-dialog/add-stock-dialog';


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
    TranslatePipe
  ],
  templateUrl: './missing-stock-resource.html',
  styleUrl: './missing-stock-resource.scss',
})
export class MissingStockResource {
  private readonly resourcesService = inject(Resource);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Estado reactivo usando Signals
  public resources = signal<ResourceModel[]>([]);
  public isLoading = signal<boolean>(true);


  // Las columnas que queremos mostrar en la tabla
  public displayedColumns: string[] = ['name', 'unit_cost', 'stock', 'unit_measure', 'updated_at', 'actions'];

  ngOnInit() {
    this.loadMissingStockResources();
  }

  loadMissingStockResources() {
    this.isLoading.set(true);

    this.resourcesService.getResources().subscribe({
      next: (response: any) => {
        // Filtramos solo los recursos con stock igual a cero
        const zeroStockResources = response.data.filter((resource: ResourceModel) => resource.current_stock === 0);
        this.resources.set(zeroStockResources);
        this.isLoading.set(false);

      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error cargando el inventario:', err)
      }
    });
  }

  onEdit(resource: ResourceModel) {
    // Navegamos al formulario pasando el objeto (puedes usar un QueryParam o un Service de estado)
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
}
