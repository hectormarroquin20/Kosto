import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Resource } from '../../../core/services/resource';
import { ResourceModel } from '../../../core/models/resource.interface';
import { IAuthService } from '../../../core/models/auth.interface';

@Component({
    selector: 'add-stock-dialog',
    templateUrl: './add-stock-dialog.html',
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
    ]
})
export class AddStockResourceDialog {
    public data = inject(MAT_DIALOG_DATA) as ResourceModel;
    private dialogRef = inject(MatDialogRef<AddStockResourceDialog>);
    private fb = inject(FormBuilder);
    private resourceService = inject(Resource);
    private authService = inject(IAuthService);

    // Track if user manually edited the average
    private avgOverridden = false;

    form = this.fb.group({
        added: [1, [Validators.required, Validators.min(1)]],
        newCost: [this.data?.unit_cost || 0, [Validators.required, Validators.min(0)]],
        avgCost: [0, [Validators.required, Validators.min(0)]]
    });

    constructor() {
        // initialize average based on current data
        const current = Number(this.data?.unit_cost || 0);
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
        const updated: ResourceModel = {
            ...this.data,
            current_stock: (this.data.current_stock || 0) + added,
            unit_cost: avg,
            tenant_id: this.authService.getTenantId() ?? ''
        };

        this.resourceService.updateResource(updated).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => alert('Error updating stock: ' + (err?.message || err))
        });
    }
}
