<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Cart\StoreCartItemRequest;
use App\Http\Requests\Api\V1\Cart\UpdateCartItemRequest;
use App\Http\Resources\Api\V1\CartItemResource;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function index(): JsonResponse
    {
        $items = CartItem::query()
            ->with([
                'product.shop:id,name',
                'product.brand:id,name',
                'product.category:id,name,slug',
                'variant:id,product_id,sku,price,stock_level,is_active',
            ])
            ->where('user_id', request()->user()->id)
            ->orderBy('id')
            ->get();

        $total = $items->sum(fn (CartItem $item) => (float) ($item->variant?->price ?? 0) * (int) $item->quantity);

        return response()->json([
            'data' => CartItemResource::collection($items),
            'meta' => [
                'total_amount' => $total,
                'items_count' => $items->count(),
            ],
        ]);
    }

    public function store(StoreCartItemRequest $request): JsonResponse
    {
        $user = $request->user();
        $variantId = $request->integer('variant_id');
        $qty = $request->integer('quantity');

        $variant = ProductVariant::query()->with('product:id,shop_id')->findOrFail($variantId);

        if (! $variant->is_active) {
            throw ValidationException::withMessages(['variant_id' => 'Variant is inactive.']);
        }

        $existingItems = CartItem::query()
            ->with('variant.product:id,shop_id')
            ->where('user_id', $user->id)
            ->get();

        $existingShopIds = $existingItems
            ->map(fn (CartItem $item) => $item->variant?->product?->shop_id)
            ->filter()
            ->unique();

        if ($existingShopIds->isNotEmpty() && ! $existingShopIds->contains($variant->product?->shop_id)) {
            throw ValidationException::withMessages([
                'variant_id' => 'Your cart contains items from different shops. Please checkout one shop at a time.',
            ]);
        }

        $item = CartItem::query()->firstOrNew([
            'user_id' => $user->id,
            'variant_id' => $variant->id,
        ]);

        $item->product_id = $variant->product_id;
        $item->quantity = (int) $item->quantity + $qty;
        $item->save();

        return response()->json([
            'message' => 'Item added to cart.',
            'data' => new CartItemResource($item->load(['product.shop', 'product.brand', 'product.category', 'variant'])),
        ], 201);
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        abort_unless((int) $cartItem->user_id === (int) $request->user()->id, 403);

        $cartItem->update([
            'quantity' => $request->integer('quantity'),
        ]);

        return response()->json([
            'message' => 'Cart item updated.',
            'data' => new CartItemResource($cartItem->load(['product.shop', 'product.brand', 'product.category', 'variant'])),
        ]);
    }

    public function destroy(CartItem $cartItem): JsonResponse
    {
        abort_unless((int) $cartItem->user_id === (int) request()->user()->id, 403);

        $cartItem->delete();

        return response()->json([
            'message' => 'Cart item removed.',
        ]);
    }

    public function clear(): JsonResponse
    {
        CartItem::query()->where('user_id', request()->user()->id)->delete();

        return response()->json([
            'message' => 'Cart cleared.',
        ]);
    }
}
