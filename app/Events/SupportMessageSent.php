<?php

namespace App\Events;

use App\Models\SupportMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class SupportMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public SupportMessage $supportMessage)
    {
        $this->supportMessage->loadMissing(['sender', 'customer', 'staff']);
    }

    public function broadcastOn(): array
    {
        $channels = [new Channel('admin-notifications')];

        $customerChannel = new PrivateChannel('user.'.$this->supportMessage->customer_id);
        $staffChannel = $this->supportMessage->staff_id
            ? new PrivateChannel('user.'.$this->supportMessage->staff_id)
            : null;

        // Do not broadcast back to the sender's own private channel.
        if ((int) $this->supportMessage->sender_id !== (int) $this->supportMessage->customer_id) {
            $channels[] = $customerChannel;
        }

        if ($staffChannel && (int) $this->supportMessage->sender_id !== (int) $this->supportMessage->staff_id) {
            $channels[] = $staffChannel;
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'SupportMessageSent';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->supportMessage->id,
            'message' => $this->supportMessage->message,
            'customer_id' => $this->supportMessage->customer_id,
            'staff_id' => $this->supportMessage->staff_id,
            'sender_id' => $this->supportMessage->sender_id,
            'sender_name' => $this->supportMessage->sender?->name,
            'attachment_url' => $this->supportMessage->attachment_path
                ? Storage::disk('public')->url($this->supportMessage->attachment_path)
                : null,
            'created_at' => $this->supportMessage->created_at?->toISOString(),
        ];
    }
}
