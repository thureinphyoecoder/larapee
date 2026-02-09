<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'product_id' => $this->product_id,
            'product_variant_id' => $this->product_variant_id,
            'quantity' => (int) $this->quantity,
            'price' => (float) $this->price,
            'line_total' => (float) $this->price * (int) $this->quantity,
            'product' => $this->whenLoaded('product', fn () => new ProductResource($this->product)),
            'variant' => $this->whenLoaded('variant', fn () => new ProductVariantResource($this->variant)),
        ];
    }
}
