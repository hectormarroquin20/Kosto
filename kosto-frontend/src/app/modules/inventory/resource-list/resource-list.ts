import { Component, inject, signal } from '@angular/core';
import { ResourceService } from '../../../core/services/resource.service';
import { ResourceModel } from '../../../core/models/resource.interface';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Router, RouterLink } from '@angular/router';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AddStockResourceDialog } from '../add-resource-stock-dialog/add-stock-dialog';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-resource-list',
  imports: [
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './resource-list.html',
  styleUrl: './resource-list.scss',
})
export class ResourceList {
  private readonly resourcesService = inject(ResourceService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Estado reactivo usando Signals
  public resources = signal<ResourceModel[]>([]);
  public isLoading = signal<boolean>(true);


  // Las columnas que queremos mostrar en la tabla
  public displayedColumns: string[] = ['name', 'unit_cost', 'stock', 'unit_measure', 'updated_at', 'actions'];

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    this.isLoading.set(true);

    this.resourcesService.getResources().subscribe({
      next: (response: any) => {
        this.resources.set(response.data);
        this.isLoading.set(false);

      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error cargando el inventario:', err)
      }
    });
  }

  onDelete(id: string) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.resourcesService.deleteResource(id).subscribe({
        next: () => {
          // Recargamos la tabla después de borrar
          this.loadResources();
        },
        error: (err) => alert('Error al borrar: ' + err.message)
      });
    }
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
        this.loadResources();
      }
    });
  }
}
