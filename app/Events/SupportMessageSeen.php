<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportMessageSeen implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $messageId,
        public int $viewerId,
        public int $customerId,
        public ?int $staffId = null,
    ) {
    }

    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->viewerId !== $this->customerId) {
            $channels[] = new PrivateChannel('user.'.$this->customerId);
        }

        if ($this->staffId && $this->viewerId !== $this->staffId) {
            $channels[] = new PrivateChannel('user.'.$this->staffId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'SupportMessageSeen';
    }

    public function broadcastWith(): array
    {
        return [
            'message_id' => $this->messageId,
            'viewer_id' => $this->viewerId,
            'customer_id' => $this->customerId,
            'staff_id' => $this->staffId,
        ];
    }
}
