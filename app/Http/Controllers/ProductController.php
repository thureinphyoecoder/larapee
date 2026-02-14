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
        $search = trim((string) $request->string('search')->toString());
        $category = trim((string) $request->string('category')->toString());
        $limit = max(1, min(48, (int) $request->integer('limit', 24)));

        $query = Product::query()
            ->with([
            'variants' => fn ($query) => $query->where('is_active', true),
            'brand',
            'shop',
        ])
            ->whereHas('variants', fn ($q) => $q->where('is_active', true))
            ->orderByDesc('is_hero')
            ->latest();

        if ($search !== '') {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($category !== '') {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category)
                    ->orWhere('id', $category);
            });
        }

        $products = $query->limit($limit)->get();

        return Inertia::render('Welcome', [
            'products' => $products->map(fn (Product $product) => $this->serializeStorefrontProduct($product))->values(),
            'categories' => Category::query()->orderBy('name')->get(),
            'filters' => [
                'search' => $search,
                'category' => $category,
                'limit' => $limit,
            ],
        ]);
    }

    public function show($slug) // ID အစား Slug နဲ့ ရှာမယ်
    {
        $product = Product::with([
            'variants' => fn ($query) => $query->where('is_active', true),
            'activeVariants' => fn ($query) => $query->where('is_active', true)->orderBy('id'),
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

        $recommendations = $this->buildAiRecommendations($product);

        return Inertia::render('ProductDetail', [
            'product' => $this->serializeStorefrontProduct($product),
            'reviews' => $reviews,
            'ratingSummary' => [
                'average' => $ratingAverage,
                'count' => $ratingCount,
            ],
            'recommendations' => $recommendations->map(fn (Product $item) => $this->serializeStorefrontProduct($item))->values(),
        ]);
    }

    private function buildAiRecommendations(Product $product, int $limit = 6)
    {
        $targetPrice = $this->resolveEffectivePrice($product);
        $targetKeywords = collect(preg_split('/\s+/', strtolower((string) $product->name)) ?: [])
            ->filter(fn ($word) => strlen((string) $word) >= 3)
            ->values();

        $candidates = Product::query()
            ->with([
                'variants' => fn ($q) => $q->where('is_active', true),
                'activeVariants' => fn ($q) => $q->where('is_active', true)->orderBy('id'),
                'shop:id,name',
                'brand:id,name',
                'category:id,name,slug',
            ])
            ->withCount(['reviews as ai_rating_count' => fn ($q) => $q->whereNotNull('rating')])
            ->withAvg(['reviews as ai_rating_avg' => fn ($q) => $q->whereNotNull('rating')], 'rating')
            ->whereKeyNot($product->id)
            ->whereHas('activeVariants')
            ->latest('id')
            ->limit(120)
            ->get();

        return $candidates
            ->map(function (Product $candidate) use ($product, $targetPrice, $targetKeywords) {
                $candidatePrice = $this->resolveEffectivePrice($candidate);
                $priceDistance = $targetPrice > 0
                    ? min(abs($targetPrice - $candidatePrice) / max($targetPrice, 1), 1)
                    : 1;
                $keywordBoost = $targetKeywords
                    ->filter(fn ($token) => str_contains(strtolower((string) $candidate->name), (string) $token))
                    ->count();

                $score = 0;
                $score += (int) ($candidate->category_id === $product->category_id) * 45;
                $score += (int) ($candidate->brand_id === $product->brand_id) * 30;
                $score += (int) ($candidate->shop_id === $product->shop_id) * 15;
                $score += (int) round((1 - $priceDistance) * 20);
                $score += (int) min(10, ($keywordBoost * 3));
                $score += (int) min(10, round(((float) ($candidate->ai_rating_avg ?? 0)) * 2));
                $score += (int) min(8, (int) ($candidate->ai_rating_count ?? 0));
                $score += (int) (($candidate->stock_level ?? 0) > 0) * 4;

                return [
                    'product' => $candidate,
                    'score' => $score,
                ];
            })
            ->sortByDesc('score')
            ->take($limit)
            ->pluck('product')
            ->values();
    }

    private function resolveEffectivePrice(Product $product): float
    {
        $variants = $product->activeVariants ?? $product->variants ?? collect();
        if ($variants->count() === 0) {
            return (float) $product->price;
        }

        return (float) $variants
            ->map(fn (ProductVariant $variant) => (float) (($variant->resolvePricing()['final_price'] ?? $variant->price) ?: 0))
            ->filter(fn ($price) => $price > 0)
            ->min();
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
            'is_hero' => (bool) ($product->is_hero ?? false),
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
