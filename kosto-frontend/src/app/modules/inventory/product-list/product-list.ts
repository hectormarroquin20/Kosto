import { Component, inject, signal, OnInit } from '@angular/core';
import { ProductModel } from '../../../core/models/product.interface';
import { ProductService } from '../../../core/services/product.service';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AddProductStockDialog } from '../add-product-stock-dialog/add-product-stock-dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  public products = signal<ProductModel[]>([]);
  public isLoading = signal<boolean>(true);


  // CORREGIDO: Estos nombres deben coincidir con los matColumnDef en el HTML
  public displayedColumns: string[] = ['name', 'price', 'stock', 'type', 'actions'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        // Aseguramos que sea un array
        const data = response.data || [];
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error cargando el inventario:', err);
      }
    });
  }

  onDelete(id: string) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => alert('Error al borrar: ' + err.message)
      });
    }
  }

  onEdit(product: ProductModel) {
    this.router.navigate(['/products/edit', product.id]);
  }

  openAddStockDialog(product: ProductModel) {
    const dialogRef = this.dialog.open(AddProductStockDialog, {
      width: '420px',
      disableClose: true,
      data: product
    });

    dialogRef.afterClosed().subscribe((updated: boolean) => {
      if (updated) {
        this.loadProducts();
      }
    });
  }
}