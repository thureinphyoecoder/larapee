<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlobalSearchController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->hasAnyRole(['admin', 'manager', 'sales']), 403);

        $q = trim((string) $request->get('q', ''));
        $normalizedQ = mb_substr($q, 0, 120);

        if ($normalizedQ === '') {
            return Inertia::render('Admin/Search/Index', [
                'q' => '',
                'results' => [
                    'products' => [],
                    'variants' => [],
                    'orders' => [],
                    'users' => [],
                ],
            ]);
        }

        $numericId = ctype_digit($normalizedQ) ? (int) $normalizedQ : null;

        $productsQuery = Product::with(['shop', 'brand', 'category'])
            ->where(function ($query) use ($normalizedQ) {
                $query->where('name', 'like', "%{$normalizedQ}%")
                    ->orWhere('sku', 'like', "%{$normalizedQ}%")
                    ->orWhereHas('brand', fn ($brandQuery) => $brandQuery->where('name', 'like', "%{$normalizedQ}%"))
                    ->orWhereHas('category', fn ($catQuery) => $catQuery->where('name', 'like', "%{$normalizedQ}%"))
                    ->orWhereHas('shop', fn ($shopQuery) => $shopQuery->where('name', 'like', "%{$normalizedQ}%"));
            })
            ->latest();

        $variantsQuery = ProductVariant::with(['product.shop'])
            ->where(function ($query) use ($normalizedQ) {
                $query->where('sku', 'like', "%{$normalizedQ}%")
                    ->orWhereHas('product', function ($productQuery) use ($normalizedQ) {
                        $productQuery->where('name', 'like', "%{$normalizedQ}%")
                            ->orWhereHas('shop', fn ($shopQuery) => $shopQuery->where('name', 'like', "%{$normalizedQ}%"));
                    });
            })
            ->latest();

        $ordersQuery = Order::with(['user', 'shop'])
            ->where(function ($query) use ($normalizedQ, $numericId) {
                if ($numericId !== null) {
                    $query->where('id', $numericId)
                        ->orWhere('status', 'like', "%{$normalizedQ}%")
                        ->orWhere('phone', 'like', "%{$normalizedQ}%");
                } else {
                    $query->where('status', 'like', "%{$normalizedQ}%")
                        ->orWhere('phone', 'like', "%{$normalizedQ}%");
                }

                $query->orWhere('address', 'like', "%{$normalizedQ}%")
                    ->orWhereHas('user', function ($userQuery) use ($normalizedQ) {
                        $userQuery->where('name', 'like', "%{$normalizedQ}%")
                            ->orWhere('email', 'like', "%{$normalizedQ}%");
                    })
                    ->orWhereHas('shop', fn ($shopQuery) => $shopQuery->where('name', 'like', "%{$normalizedQ}%"));
            })
            ->latest();

        $usersQuery = User::with(['roles', 'shop'])
            ->where(function ($query) use ($normalizedQ) {
                $query->where('name', 'like', "%{$normalizedQ}%")
                    ->orWhere('email', 'like', "%{$normalizedQ}%")
                    ->orWhereHas('roles', fn ($roleQuery) => $roleQuery->where('name', 'like', "%{$normalizedQ}%"))
                    ->orWhereHas('shop', fn ($shopQuery) => $shopQuery->where('name', 'like', "%{$normalizedQ}%"));
            })
            ->latest();

        if (!$user->hasRole('admin')) {
            $productsQuery->where('shop_id', $user->shop_id);
            $variantsQuery->whereHas('product', fn ($query) => $query->where('shop_id', $user->shop_id));
            $ordersQuery->where('shop_id', $user->shop_id);
            $usersQuery->where('shop_id', $user->shop_id);
        }

        return Inertia::render('Admin/Search/Index', [
            'q' => $normalizedQ,
            'results' => [
                'products' => $productsQuery->take(12)->get(),
                'variants' => $variantsQuery->take(12)->get(),
                'orders' => $ordersQuery->take(12)->get(),
                'users' => $usersQuery->take(12)->get(),
            ],
        ]);
    }
}
