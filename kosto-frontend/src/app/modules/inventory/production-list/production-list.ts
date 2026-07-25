import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

import { ProductionForm } from '../production-form/production-form';
import { ProductModel } from '../../../core/models/product.interface';
import { ProductService } from '../../../core/services/product.service';
import { MainKostoComponent } from "@/components/main-kosto/main-kosto";

@Component({
  selector: 'app-production-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TranslatePipe,
    MainKostoComponent
  ],
  templateUrl: './production-list.html',
  styleUrl: './production-list.scss',
})
export class ProductionList implements OnInit {
  private dialog = inject(MatDialog);
  private productService = inject(ProductService); // 1. Inject the actual service

  // 2. The signal starts empty and typed with your model
  public dataSource = signal<ProductModel[]>([]);
  public isLoading = signal<boolean>(true);
  public filter = signal('');

  public filteredData = computed(() => {
    const f = this.filter().toLowerCase();
    if (!f) return this.dataSource();
    return this.dataSource().filter(p =>
      p.name.toLowerCase().includes(f)
    );
  });

  // Note: I changed 'name' to 'name' (according to your model) and 'stock' to 'current_stock'
  displayedColumns: string[] = ['name', 'sale_price', 'current_stock', 'actions'];

  ngOnInit() {
    this.loadPremadeProducts();
  }

  loadPremadeProducts() {
    this.isLoading.set(true);
    this.productService.getProducts(true).subscribe({
      next: (response: any) => {
        // 1. Extract the data
        const rawData = response.data || response; // In case it comes directly or wrapped

        // 2. Strict normalization: if it's an object, put it in an array, if it's an array, leave it
        const dataArray = Array.isArray(rawData) ? rawData : [rawData];

        this.dataSource.set(dataArray);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading inventory:', err);
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
        // 4. Reload the table to see the updated stock after producing
        this.loadPremadeProducts();
      }
    });
  }
}

