<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'stock_level' => (int) $this->stock_level,
            'description' => $this->description,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'shop' => $this->whenLoaded('shop', fn () => new ShopResource($this->shop)),
            'brand' => $this->whenLoaded('brand', fn () => new BrandResource($this->brand)),
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'variants' => $this->whenLoaded('variants', fn () => ProductVariantResource::collection($this->variants)),
            'active_variants' => $this->whenLoaded('activeVariants', fn () => ProductVariantResource::collection($this->activeVariants)),
        ];
    }
}
