<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;
use App\Services\MobilePushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;

class SendCustomerOrderStatusPush implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        private readonly MobilePushNotificationService $pushService,
    ) {
    }

    public function handle(OrderStatusUpdated $event): void
    {
        $order = $event->order;

        if (! $order->user_id) {
            return;
        }

        $status = strtoupper((string) $order->status);
        $title = 'Order Update';
        $body = "Order #{$order->id} is now {$status}.";
        $dedupeKey = 'push:order-status:' . (int) $order->id . ':' . strtolower((string) $order->status);
        $lock = Cache::lock($dedupeKey, 120);
        if (! $lock->get()) {
            return;
        }

        try {
            $this->pushService->sendToUser(
                userId: (int) $order->user_id,
                title: $title,
                body: $body,
                data: [
                    'type' => 'order_status',
                    'order_id' => $order->id,
                    'status' => $order->status,
                ],
                app: 'customer-mobile',
            );
        } finally {
            optional($lock)->release();
        }
    }
}
