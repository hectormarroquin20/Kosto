import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ProductModel } from '../../../core/models/product.interface';
import { ProductService } from '../../../core/services/product.service';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { TranslatePipe } from '@ngx-translate/core';
import { AddProductStockDialog } from '../add-product-stock-dialog/add-product-stock-dialog';
import { MatDialog } from '@angular/material/dialog';
import { MainKostoComponent } from "@/components/main-kosto/main-kosto";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    MainKostoComponent
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
  public filter = signal('');

  public filteredProducts = computed(() => {
    const f = this.filter().toLowerCase();
    if (!f) return this.products();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(f)
    );
  });

  // Define the columns to be displayed in the table
  public displayedColumns: string[] = ['name', 'price', 'stock', 'type', 'actions'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        // Ensure the data is an array
        const data = response.data || [];
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading inventory:', err);
      }
    });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => alert('Error deleting: ' + err.message)
      });
    }
  }

  onEdit(product: ProductModel) {
    // Navigate to the edit page for the selected product
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
        // Reload the products list after updating stock
        this.loadProducts();
      }
    });
  }
}