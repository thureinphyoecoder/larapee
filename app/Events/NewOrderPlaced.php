<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderPlaced implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;

    /**
     * Create a new event instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order->loadMissing(['user', 'shop']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new Channel('admin-notifications'),
        ];

        if ($this->order->shop_id) {
            $channels[] = new PrivateChannel('shop.' . (int) $this->order->shop_id . '.notifications');
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'NewOrderPlaced';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'message' => "Order အသစ် #{$this->order->id} တက်လာပါပြီ။",
            'amount' => number_format($this->order->total_amount) . ' MMK',
            'time' => now()->diffForHumans(),
            'created_at' => $this->order->created_at?->toISOString(),
            'order' => [
                'id' => $this->order->id,
                'status' => $this->order->status,
                'total_amount' => $this->order->total_amount,
                'created_at' => $this->order->created_at,
                'user' => [
                    'name' => $this->order->user?->name,
                ],
                'shop_id' => $this->order->shop_id,
                'shop' => [
                    'id' => $this->order->shop?->id,
                    'name' => $this->order->shop?->name,
                ],
            ],
        ];
    }
}
