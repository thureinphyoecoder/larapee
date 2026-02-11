<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with([
            'variants' => fn ($query) => $query->where('is_active', true),
            'brand',
            'shop',
        ])->latest()->get();

        return Inertia::render('Welcome', [
            'products' => $products->map(fn (Product $product) => $this->serializeStorefrontProduct($product))->values(),
            'categories' => Category::all(),
            'filters' => $request->only(['search', 'category'])
        ]);
    }

    public function show($slug) // ID အစား Slug နဲ့ ရှာမယ်
    {
        $product = Product::with([
            'variants' => fn ($query) => $query->where('is_active', true),
            'shop',
            'brand',
            'category',
        ])
            ->where('slug', $slug)
            ->firstOrFail();

        $reviews = $product->reviews()
            ->with('user')
            ->latest()
            ->get()
            ->map(fn ($review) => [
                'id' => $review->id,
                'reviewer_name' => $review->reviewer_name ?: ($review->user?->name ?? 'Customer'),
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at_human' => $review->created_at?->diffForHumans(),
                'created_at' => $review->created_at,
            ])
            ->values();

        $ratingQuery = $product->reviews()->whereNotNull('rating');
        $ratingCount = (clone $ratingQuery)->count();
        $ratingAverage = $ratingCount > 0
            ? round((float) (clone $ratingQuery)->avg('rating'), 1)
            : 0.0;

        return Inertia::render('ProductDetail', [
            'product' => $this->serializeStorefrontProduct($product),
            'reviews' => $reviews,
            'ratingSummary' => [
                'average' => $ratingAverage,
                'count' => $ratingCount,
            ],
        ]);
    }

    private function serializeStorefrontProduct(Product $product): array
    {
        $variants = $product->variants->map(function (ProductVariant $variant): array {
            $pricing = $variant->resolvePricing();

            return [
                'id' => $variant->id,
                'product_id' => $variant->product_id,
                'sku' => $variant->sku,
                'price' => (float) $variant->price,
                'effective_price' => (float) ($pricing['final_price'] ?? $variant->price),
                'base_price' => (float) ($pricing['base_price'] ?? $variant->price),
                'discount_amount' => (float) ($pricing['discount_amount'] ?? 0),
                'discount_percent' => (float) ($pricing['discount_percent'] ?? 0),
                'promotion' => $pricing['promotion'] ?? null,
                'stock_level' => (int) $variant->stock_level,
                'is_active' => (bool) $variant->is_active,
            ];
        })->values();

        $basePrice = $variants->count() > 0
            ? (float) $variants->min('base_price')
            : (float) $product->price;
        $effectivePrice = $variants->count() > 0
            ? (float) $variants->min('effective_price')
            : $basePrice;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'price' => $effectivePrice,
            'base_price' => $basePrice,
            'has_discount' => $effectivePrice < $basePrice,
            'stock_level' => (int) $product->stock_level,
            'description' => $product->description,
            'image_path' => $product->image_path,
            'image_url' => $product->image_path ? Storage::disk('public')->url($product->image_path) : null,
            'category_id' => $product->category_id,
            'shop' => $product->shop?->only(['id', 'name']),
            'brand' => $product->brand?->only(['id', 'name']),
            'category' => $product->category?->only(['id', 'name', 'slug']),
            'variants' => $variants,
        ];
    }
}
