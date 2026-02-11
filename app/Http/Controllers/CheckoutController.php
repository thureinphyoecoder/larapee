<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\CartItem;
use Illuminate\Support\Facades\Auth;

class CheckoutController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $user->loadMissing('profile');
        $cartItems = CartItem::with(['product', 'variant'])
            ->where('user_id', $user->id)
            ->get();

        $cartItems->transform(function (CartItem $item) {
            $pricing = $item->variant?->resolvePricing() ?? [
                'base_price' => (float) ($item->variant?->price ?? 0),
                'final_price' => (float) ($item->variant?->price ?? 0),
                'discount_amount' => 0.0,
                'promotion' => null,
            ];

            $qty = (int) $item->quantity;
            $item->setAttribute('base_unit_price', (float) ($pricing['base_price'] ?? 0));
            $item->setAttribute('effective_unit_price', (float) ($pricing['final_price'] ?? 0));
            $item->setAttribute('line_total', (float) ($pricing['final_price'] ?? 0) * $qty);
            $item->setAttribute('discount_line_total', (float) ($pricing['discount_amount'] ?? 0) * $qty);
            $item->setAttribute('promotion', $pricing['promotion'] ?? null);

            return $item;
        });

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index');
        }

        $lastOrder = \App\Models\Order::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        $profilePhone = $user->profile?->phone_number;
        $profileAddress = $user->profile?->address_line_1;
        $orderPhone = $lastOrder?->phone;
        $orderAddress = $lastOrder?->address;

        return Inertia::render('Checkout/Index', [
            'cartItems' => $cartItems,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $profilePhone ?: $orderPhone ?: '',
                'address' => $profileAddress ?: $orderAddress ?: '',
            ]
        ]);
    }
}
