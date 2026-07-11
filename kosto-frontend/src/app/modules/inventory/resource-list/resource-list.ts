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
import { MainKostoComponent } from "@/components/main-kosto/main-kosto";

@Component({
  selector: 'app-resource-list',
  imports: [
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    TranslatePipe,
    MainKostoComponent
  ],
  templateUrl: './resource-list.html',
  styleUrl: './resource-list.scss',
})
export class ResourceList {
  private readonly resourcesService = inject(ResourceService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Reactive state using Signals
  public resources = signal<ResourceModel[]>([]);
  public isLoading = signal<boolean>(true);

  // Columns we want to show in the table
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
        console.error('Error loading inventory:', err)
      }
    });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.resourcesService.deleteResource(id).subscribe({
        next: () => {
          // Reload the table after deleting
          this.loadResources();
        },
        error: (err) => alert('Error deleting: ' + err.message)
      });
    }
  }

  onEdit(resource: ResourceModel) {
    // Navigate to the form passing the object (you can use a QueryParam or a State Service)
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
