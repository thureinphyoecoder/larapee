<?php

namespace App\Actions\Orders;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class CreateOrderFromCartAction
{
    public function __construct(
        private readonly CreateOrderFromItemsAction $createOrderFromItemsAction,
    ) {
    }

    public function execute(
        User $user,
        string $phone,
        string $address,
        ?int $shopId = null,
        ?UploadedFile $paymentSlip = null,
    ): Order {
        $cartItems = CartItem::query()
            ->with('variant:id')
            ->where('user_id', $user->id)
            ->get(['id', 'variant_id', 'quantity']);

        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => 'Cart is empty.',
            ]);
        }

        $items = $cartItems
            ->map(fn (CartItem $item) => [
                'variant_id' => (int) $item->variant_id,
                'quantity' => (int) $item->quantity,
            ])
            ->all();

        $order = $this->createOrderFromItemsAction->execute(
            user: $user,
            items: $items,
            phone: $phone,
            address: $address,
            forcedShopId: $shopId,
            paymentSlip: $paymentSlip,
        );

        CartItem::query()->where('user_id', $user->id)->delete();

        return $order;
    }
}
