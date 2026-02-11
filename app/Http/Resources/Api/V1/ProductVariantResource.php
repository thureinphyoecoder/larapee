<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pricing = $this->resolvePricing();

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'effective_price' => (float) ($pricing['final_price'] ?? $this->price),
            'base_price' => (float) ($pricing['base_price'] ?? $this->price),
            'discount_amount' => (float) ($pricing['discount_amount'] ?? 0),
            'discount_percent' => (float) ($pricing['discount_percent'] ?? 0),
            'promotion' => $pricing['promotion'] ?? null,
            'stock_level' => (int) $this->stock_level,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
