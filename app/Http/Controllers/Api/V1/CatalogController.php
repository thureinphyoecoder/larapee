<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Catalog\ProductIndexRequest;
use App\Http\Resources\Api\V1\BrandResource;
use App\Http\Resources\Api\V1\CategoryResource;
use App\Http\Resources\Api\V1\ProductResource;
use App\Http\Resources\Api\V1\ShopResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    public function products(ProductIndexRequest $request): JsonResponse
    {
        $query = Product::query()
            ->select('products.*')
            ->selectSub(function ($sub) {
                $sub->from('order_items')
                    ->join('orders', 'orders.id', '=', 'order_items.order_id')
                    ->whereColumn('order_items.product_id', 'products.id')
                    ->whereNotIn('orders.status', ['cancelled'])
                    ->selectRaw('COALESCE(SUM(COALESCE(order_items.quantity, order_items.qty, 0)), 0)');
            }, 'sold_count')
            ->with([
                'shop:id,name',
                'brand:id,name',
                'category:id,name,slug',
                'activeVariants' => fn ($q) => $q->orderBy('id'),
            ])
            ->latest('id');

        $query->when($request->filled('q'), function ($q) use ($request) {
            $keyword = trim($request->string('q')->toString());
            $q->where(function ($qq) use ($keyword) {
                $qq->where('name', 'like', "%{$keyword}%")
                    ->orWhere('sku', 'like', "%{$keyword}%");
            });
        });

        $query->when($request->filled('shop_id'), fn ($q) => $q->where('shop_id', $request->integer('shop_id')));
        $query->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->integer('category_id')));
        $query->when($request->filled('brand_id'), fn ($q) => $q->where('brand_id', $request->integer('brand_id')));
        $query->when($request->boolean('active_only'), fn ($q) => $q->whereHas('activeVariants'));

        $products = $query->paginate($request->integer('per_page', 20))->withQueryString();

        return response()->json([
            'data' => ProductResource::collection($products->getCollection()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function product(Product $product): JsonResponse
    {
        $soldCount = (int) DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('order_items.product_id', $product->id)
            ->whereNotIn('orders.status', ['cancelled'])
            ->selectRaw('COALESCE(SUM(COALESCE(order_items.quantity, order_items.qty, 0)), 0) as sold_count')
            ->value('sold_count');

        $product->setAttribute('sold_count', $soldCount);
        $product->load([
            'shop:id,name',
            'brand:id,name',
            'category:id,name,slug',
            'variants' => fn ($q) => $q->orderBy('id'),
            'activeVariants' => fn ($q) => $q->orderBy('id'),
            'reviews' => fn ($q) => $q->with('user:id,name')->latest('id')->limit(20),
        ]);
        $product->setRelation('aiRecommendations', $this->buildAiRecommendations($product));

        return response()->json([
            'data' => new ProductResource($product),
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
                'shop:id,name',
                'brand:id,name',
                'category:id,name,slug',
                'activeVariants' => fn ($q) => $q->where('is_active', true)->orderBy('id'),
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
        $variants = $product->activeVariants ?? collect();
        if ($variants->count() === 0) {
            return (float) $product->price;
        }

        return (float) $variants
            ->map(fn (ProductVariant $variant) => (float) (($variant->resolvePricing()['final_price'] ?? $variant->price) ?: 0))
            ->filter(fn ($price) => $price > 0)
            ->min();
    }

    public function meta(): JsonResponse
    {
        return response()->json([
            'shops' => ShopResource::collection(Shop::query()->orderBy('name')->get()),
            'categories' => CategoryResource::collection(Category::query()->orderBy('name')->get()),
            'brands' => BrandResource::collection(Brand::query()->orderBy('name')->get()),
        ]);
    }
}
