import { Component, computed, inject, signal } from '@angular/core';
import { TransactionLogModel } from '../../../core/models/transaction-log.interface';
import { TransactionLogService } from '../../../core/services/transaction-log.service';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { RouterLink } from '@angular/router';
import { ProductModel } from '../../../core/models/product.interface';
import { ProductService } from '../../../core/services/product.service';
import { forkJoin } from 'rxjs';

import { TranslatePipe } from '@ngx-translate/core';
import { MainKostoComponent } from "@/components/main-kosto/main-kosto";

@Component({
  selector: 'app-transaction-log',
  imports: [
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    TranslatePipe,
    MainKostoComponent
  ],
  templateUrl: './transaction-log.html',
  styleUrl: './transaction-log.scss',
})
export class TransactionLog {
  private readonly transactionLogService = inject(TransactionLogService);
  private readonly productService = inject(ProductService);

  // Reactive state using Signals
  public transactionLogs = signal<TransactionLogModel[]>([]);
  public products = signal<ProductModel[]>([]);

  public isLoading = signal<boolean>(true);

  // Create a quick search map O(1) for the HTML
  public productMap = computed(() => {
    const map = new Map<string, ProductModel>(); // Store the whole object
    this.products().forEach(p => map.set(p.id!, p));
    return map;
  });

  // Columns we want to display in the table
  public displayedColumns: string[] = ['type', 'product_name', 'quantity', 'total_amount', 'transaction_date'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.transactionLogService.getTransactionLogs().subscribe({
      next: (response: any) => {
        // FIX: If response.data is an object, put it in an array [response.data]
        // If response.data is an array, use response.data directly
        const data = Array.isArray(response.data) ? response.data : [response.data];

        this.transactionLogs.set(data);
      },
      error: (err) => console.error('Error loading the logs:', err)
    });
    forkJoin({
      logs: this.transactionLogService.getTransactionLogs(),
      prods: this.productService.getProducts()
    }).subscribe({
      next: (res) => {
        // Strict normalization: if it comes { data: ... } use data, if not, the res directly
        const logsRaw = (res.logs as any).data || res.logs;
        const prodsRaw = (res.prods as any).data || res.prods;

        // Force it to always be an array, even if it comes as a single object
        const logsData = Array.isArray(logsRaw) ? logsRaw : [logsRaw];
        const prodsData = Array.isArray(prodsRaw) ? prodsRaw : [prodsRaw];

        this.transactionLogs.set(logsData);
        this.products.set(prodsData);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading data:', err)
      }
    });
  }
}
