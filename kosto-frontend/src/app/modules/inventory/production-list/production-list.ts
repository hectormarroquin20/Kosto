import { Component, inject, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';

import { ProductionForm } from '../production-form/production-form';
import { ProductModel } from '../../../core/models/product.interface';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-production-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    TranslatePipe
  ],
  templateUrl: './production-list.html',
  styleUrl: './production-list.scss',
})
export class ProductionList {
  private dialog = inject(MatDialog);
  private productService = inject(ProductService); // 1. Inyectamos tu servicio real

  // 2. La señal ahora arranca vacía y tipada con tu modelo
  dataSource = signal<ProductModel[]>([]);
  public isLoading = signal<boolean>(true);

  // Nota: Cambié 'name' a 'name' (según tu modelo) y 'stock' a 'current_stock'
  displayedColumns: string[] = ['name', 'sale_price', 'current_stock', 'actions'];

  ngOnInit() {
    this.loadPremadeProducts();
  }

  loadPremadeProducts() {
    this.isLoading.set(true);
    this.productService.getProducts(true).subscribe({
      next: (response: any) => {
        // 1. Extraemos los datos
        const rawData = response.data || response; // Por si a veces viene directo o envuelto

        // 2. Normalización estricta: si es objeto, lo metemos en un array, si es array, lo dejamos
        const dataArray = Array.isArray(rawData) ? rawData : [rawData];

        console.log('Datos procesados para la tabla:', dataArray); // ¡MIRA ESTO EN LA CONSOLA!

        this.dataSource.set(dataArray);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error cargando el inventario:', err);
      }
    });
  }

  openProductionDialog(product: ProductModel) {
    const dialogRef = this.dialog.open(ProductionForm, {
      width: '450px',
      disableClose: true,
      data: {
        product_id: product.id,
        product_name: product.name,
        current_stock: product.current_stock,
        sale_price: product.sale_price
      }
    });

    dialogRef.afterClosed().subscribe((needsRefresh: boolean) => {
      if (needsRefresh) {
        // 4. Recargamos la tabla para ver el stock actualizado tras producir
        this.loadPremadeProducts();
      }
    });
  }
}
