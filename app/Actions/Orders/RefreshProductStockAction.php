<?php

namespace App\Actions\Orders;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RefreshProductStockAction
{
    public function execute(array|Collection $productIds): void
    {
        $ids = collect($productIds)->filter()->unique()->values();
        if ($ids->isEmpty()) {
            return;
        }

        // Single set-based update for all affected products.
        Product::query()
            ->whereIn('id', $ids)
            ->update([
                'stock_level' => DB::raw('(select coalesce(sum(product_variants.stock_level), 0) from product_variants where product_variants.product_id = products.id and product_variants.is_active = 1)'),
                'price' => DB::raw('(select coalesce(min(product_variants.price), 0) from product_variants where product_variants.product_id = products.id and product_variants.is_active = 1)'),
            ]);
    }
}
