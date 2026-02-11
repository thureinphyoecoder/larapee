<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pricing = $this->variant?->resolvePricing() ?? [
            'base_price' => (float) ($this->variant?->price ?? 0),
            'final_price' => (float) ($this->variant?->price ?? 0),
            'discount_amount' => 0.0,
            'promotion' => null,
        ];
        $price = (float) ($pricing['final_price'] ?? 0);
        $basePrice = (float) ($pricing['base_price'] ?? $price);
        $qty = (int) $this->quantity;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'quantity' => $qty,
            'base_unit_price' => $basePrice,
            'unit_price' => $price,
            'line_total' => $price * $qty,
            'discount_line_total' => max(0, ($basePrice - $price) * $qty),
            'promotion' => $pricing['promotion'] ?? null,
            'product' => $this->whenLoaded('product', fn () => new ProductResource($this->product)),
            'variant' => $this->whenLoaded('variant', fn () => new ProductVariantResource($this->variant)),
        ];
    }
}
