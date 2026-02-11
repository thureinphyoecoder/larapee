<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $activeVariants = $this->relationLoaded('activeVariants') ? $this->activeVariants : collect();
        $reviews = $this->relationLoaded('reviews') ? $this->reviews : collect();
        $ratingCount = $reviews->whereNotNull('rating')->count();
        $ratingAverage = $ratingCount > 0
            ? round((float) ($reviews->whereNotNull('rating')->avg('rating') ?? 0), 1)
            : 0.0;
        $basePrice = $activeVariants->count() > 0
            ? (float) $activeVariants->min(fn ($variant) => (float) ($variant->price ?? 0))
            : (float) $this->price;
        $effectivePrice = $activeVariants->count() > 0
            ? (float) $activeVariants->min(fn ($variant) => (float) (($variant->resolvePricing()['final_price'] ?? $variant->price) ?: 0))
            : $basePrice;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'price' => $effectivePrice,
            'base_price' => $basePrice,
            'has_discount' => $effectivePrice < $basePrice,
            'stock_level' => (int) $this->stock_level,
            'description' => $this->description,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'shop' => $this->whenLoaded('shop', fn () => new ShopResource($this->shop)),
            'brand' => $this->whenLoaded('brand', fn () => new BrandResource($this->brand)),
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'variants' => $this->whenLoaded('variants', fn () => ProductVariantResource::collection($this->variants)),
            'active_variants' => $this->whenLoaded('activeVariants', fn () => ProductVariantResource::collection($this->activeVariants)),
            'reviews' => $this->whenLoaded('reviews', function () {
                return $this->reviews->map(fn ($review) => [
                    'id' => $review->id,
                    'reviewer_name' => $review->reviewer_name ?: $review->user?->name,
                    'rating' => $review->rating !== null ? (int) $review->rating : null,
                    'comment' => $review->comment,
                    'created_at' => optional($review->created_at)->toISOString(),
                ])->values();
            }),
            'rating_summary' => $this->whenLoaded('reviews', fn () => [
                'average' => $ratingAverage,
                'count' => $ratingCount,
            ]),
            'recommendations' => $this->when($this->relationLoaded('aiRecommendations'), function () use ($request) {
                return $this->aiRecommendations
                    ->map(fn ($product) => (new ProductResource($product))->toArray($request))
                    ->values();
            }),
        ];
    }
}
