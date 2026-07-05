import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductModel } from '../../../core/models/product.interface'; // Updated import
import { IAuthService } from '../../../core/models/auth.interface';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'add-product-stock-dialog',
    templateUrl: './add-product-stock-dialog.html',
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        TranslatePipe
    ]
})
export class AddProductStockDialog {
    public data = inject(MAT_DIALOG_DATA) as ProductModel;
    private dialogRef = inject(MatDialogRef<AddProductStockDialog>);
    private fb = inject(FormBuilder);
    private productService = inject(ProductService);
    private authService = inject(IAuthService);
    private router = inject(Router);

    // Track if user manually edited the average
    private avgOverridden = false;

    form = this.fb.group({
        added: [1, [Validators.required, Validators.min(1)]],
        newCost: [this.data?.sale_price || 0, [Validators.required, Validators.min(0)]],
        avgCost: [0, [Validators.required, Validators.min(0)]]
    });

    constructor() {
        // initialize average based on current data
        console.log("valores recibidos: ", this.data);
        const current = Number(this.data?.sale_price || 0);
        const newC = Number(this.form.get('newCost')?.value || 0);
        const initialAvg = (current + newC) / 2;
        this.form.get('avgCost')?.setValue(parseFloat(initialAvg.toFixed(2)), { emitEvent: false });

        // When newCost changes, update avgCost unless user manually changed it
        this.form.get('newCost')?.valueChanges.subscribe((val) => {
            if (this.avgOverridden) return;
            const n = Number(val || 0);
            const avg = (current + n) / 2;
            this.form.get('avgCost')?.setValue(parseFloat(avg.toFixed(2)), { emitEvent: false });
        });

        // Detect manual edits to avgCost (only from user, programmatic sets use emitEvent:false)
        this.form.get('avgCost')?.valueChanges.subscribe(() => {
            this.avgOverridden = true;
        });
    }

    onCancel() {
        this.dialogRef.close(false);
    }

    onConfirm() {
        if (this.form.invalid) return;
        const added = Number(this.form.value.added as number);
        const avg = Number(this.form.value.avgCost);
        const updated: ProductModel = {
            ...this.data,
            current_stock: (this.data.current_stock || 0) + added,
            sale_price: avg,
            tenant_id: this.authService.getTenantId() ?? ''
        };

        this.productService.updateProduct(updated).subscribe({
            next: () => {
                this.dialogRef.close(true);
                this.router.navigate(['/products']);
            },
            error: (err) => alert('Error updating stock: ' + (err?.message || err))
        });
    }
}

