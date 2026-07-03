import { Component, inject, signal } from '@angular/core';
import { Resource } from '../../../core/services/resource';
import { ResourceModel } from '../../../core/models/resource.interface';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Router, RouterLink } from '@angular/router';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';


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
  private readonly resourcesService = inject(Resource);
  private readonly router = inject(Router);

  // Estado reactivo usando Signals
  public resources = signal<ResourceModel[]>([]);
  public isLoading = signal<boolean>(true);


  // Las columnas que queremos mostrar en la tabla
  public displayedColumns: string[] = ['name', 'unit_cost', 'stock', 'unit_measure', 'updated_at', 'actions'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);

    this.resourcesService.getResources().subscribe({
      next: (response: any) => {
        console.log('Lo que llega del backend:', response);
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
          this.loadProducts();
        },
        error: (err) => alert('Error al borrar: ' + err.message)
      });
    }
  }

  onEdit(resource: ResourceModel) {
    // Navegamos al formulario pasando el objeto (puedes usar un QueryParam o un Service de estado)
    this.router.navigate(['/resources/edit', resource.id]);
  }
}
