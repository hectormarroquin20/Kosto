import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { Observable, startWith, map } from 'rxjs';

import { TransactionLogService } from '../../../core/services/transaction-log.service';
import { Product } from '../../../core/services/product'; // Tu servicio de productos
import { ProductModel } from '../../../core/models/product.interface';

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, AsyncPipe, MatAutocompleteModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule
  ],
  templateUrl: './sales-form.html',
  styleUrl: './sales-form.scss',
})
export class SalesForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly transactionService = inject(TransactionLogService);
  private readonly productService = inject(Product);
  protected readonly router = inject(Router);

  // Estado local de productos
  public allProducts = signal<ProductModel[]>([]);
  public filteredProducts$!: Observable<ProductModel[]>;

  public form: FormGroup = this.fb.group({
    type: ['SALE', Validators.required],
    product: ['', Validators.required], // Input visual para el usuario
    reference_id: ['', Validators.required], // ID oculto para el backend
    quantity: [1, [Validators.required, Validators.min(1)]],
    total_amount: [0, [Validators.required, Validators.min(0)]]
  });


  ngOnInit() {
    this.productService.getProducts().subscribe(res => {
      const data = Array.isArray(res) ? res : (res as any).data;
      this.allProducts.set(data);

      this.filteredProducts$ = this.form.get('product')!.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(typeof value === 'string' ? value : value?.name || ''))
      );
    });

    // 2. Reactividad: Recalcular total si cambia la cantidad
    this.form.get('quantity')?.valueChanges.subscribe(qty => {
      const product = this.form.get('product')?.value;
      // Si el usuario ya seleccionó un producto y este tiene precio, calculamos
      if (product && typeof product === 'object' && product.sale_price) {
        const newTotal = (product.sale_price * (qty || 0));
        this.form.patchValue({ total_amount: newTotal }, { emitEvent: false });
      }
    });
  }

  private _filter(name: string): ProductModel[] {
    const filterValue = name.toLowerCase();
    return this.allProducts().filter(p => p.name.toLowerCase().includes(filterValue));
  }

  displayFn(product: ProductModel): string {
    return product ? product.name : '';
  }

  onProductSelected(event: any) {
    const product: ProductModel = event.option.value;
    this.form.patchValue({ reference_id: product.id });

    const unitPrice = product.sale_price || 0;
    const quantity = this.form.get('quantity')?.value || 1;

    this.form.patchValue({
      reference_id: product.id,
      total_amount: unitPrice * quantity
    });
  }

  save() {
    if (this.form.valid) {
      // Eliminamos el campo 'product' (objeto) antes de enviar al backend
      const { product, ...payload } = this.form.value;
      this.transactionService.createTransactionLog(payload).subscribe({
        next: () => this.router.navigate(['/inventory/sales']),
        error: (err) => console.error('Error al guardar:', err)
      });
    }
  }
}