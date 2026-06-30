import { Routes } from '@angular/router';

export const routes: Routes = [
    // 1. Cuando entren a misaas.com/products -> Carga la tabla de productos
    {
        path: 'products',
        loadComponent: () => import('./modules/inventory/product-list/product-list').then(m => m.ProductList)
    },

    // 2. Cuando entren a misaas.com/products/new -> Carga los textboxes
    {
        path: 'products/new',
        loadComponent: () => import('./modules/inventory/product-form/product-form').then(m => m.ProductForm)
    },

    // 3. Cuando entren a misaas.com/products/edit/:id -> Carga el formulario de edición
    {
        path: 'products/edit/:id',
        loadComponent: () => import('./modules/inventory/product-form/product-form').then(m => m.ProductForm)
    },

    // 4. Cuando entren a misaas.com/resources -> Carga la tabla de insumos
    {
        path: 'resources',
        loadComponent: () => import('./modules/inventory/resource-list/resource-list').then(m => m.ResourceList)
    },

    // 5. Cuando entren a misaas.com/resources/edit/:id -> Carga el formulario de edición
    {
        path: 'resources/edit/:id',
        loadComponent: () => import('./modules/inventory/resource-form/resource-form').then(m => m.ResourceForm)
    },

    // 5. Cuando entren a misaas.com/resources/new -> Carga los textboxes
    {
        path: 'resources/new',
        loadComponent: () => import('./modules/inventory/resource-form/resource-form').then(m => m.ResourceForm)
    },

    // 6. Cuando entren a misaas.com/transaction-logs -> Carga la tabla de registros de transacción
    {
        path: 'transaction-logs',
        loadComponent: () => import('./modules/inventory/transaction-log/transaction-log').then(m => m.TransactionLog)
    },

    // 7. Cuando entren a misaas.com/tenants -> Carga la tabla de tenants
    {
        path: 'tenants',
        loadComponent: () => import('./modules/inventory/tenant/tenant-form').then(m => m.TenantForm)
    },

    // 8. Cuando entren a misaas.com/recipes -> Carga la tabla de recetas
    {
        path: 'recipes',
        loadComponent: () => import('./modules/inventory/recipe-list/recipe-list').then(m => m.RecipeList)
    },

    // 9. Cuando entren a misaas.com/recipes/new -> Carga la tabla de recetas
    {
        path: 'recipes/new',
        loadComponent: () => import('./modules/inventory/recipe-form/recipe-form').then(m => m.RecipeForm)
    },

    // 10. Cuando entren a misaas.com/recipes/new -> Carga la tabla de recetas
    {
        path: 'recipes/edit/:id',
        loadComponent: () => import('./modules/inventory/recipe-form/recipe-form').then(m => m.RecipeForm)
    },

    // 10. Cuando entren a misaas.com/recipes/new -> Carga la tabla de recetas
    {
        path: 'sales/new',
        loadComponent: () => import('./modules/inventory/sales-form/sales-form').then(m => m.SalesForm)
    },

    // 99. Ruta por defecto: si entran a la raíz, mándalos al inventario
    { path: '', redirectTo: 'products', pathMatch: 'full' }
];
