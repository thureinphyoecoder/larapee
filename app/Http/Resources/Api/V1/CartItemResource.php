<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $price = (float) ($this->variant?->price ?? 0);
        $qty = (int) $this->quantity;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'quantity' => $qty,
            'unit_price' => $price,
            'line_total' => $price * $qty,
            'product' => $this->whenLoaded('product', fn () => new ProductResource($this->product)),
            'variant' => $this->whenLoaded('variant', fn () => new ProductVariantResource($this->variant)),
        ];
    }
}
