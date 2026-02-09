<?php

namespace App\Services;

use App\Models\SupportMessage;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SupportChatQueryService
{
    public function customerMessages(User $customer, int $perPage = 30): LengthAwarePaginator
    {
        return SupportMessage::query()
            ->with(['sender:id,name', 'staff:id,name'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'message_page');
    }

    public function assignedStaffForCustomer(User $customer): ?array
    {
        $staff = SupportMessage::query()
            ->with('staff:id,name')
            ->where('customer_id', $customer->id)
            ->whereNotNull('staff_id')
            ->latest('id')
            ->first()?->staff;

        if (! $staff) {
            return null;
        }

        return [
            'id' => $staff->id,
            'name' => $staff->name,
        ];
    }

    public function adminConversations(User $viewer): Collection
    {
        $isAdmin = $viewer->hasRole('admin');

        $latestIds = SupportMessage::query()
            ->select('customer_id', DB::raw('MAX(id) as latest_id'))
            ->when(! $isAdmin, function ($query) use ($viewer) {
                $query->where(function ($q) use ($viewer) {
                    $q->where('staff_id', $viewer->id)->orWhereNull('staff_id');
                });
            })
            ->groupBy('customer_id')
            ->pluck('latest_id');

        return SupportMessage::query()
            ->with('customer:id,name')
            ->whereIn('id', $latestIds)
            ->orderByDesc('id')
            ->get()
            ->map(function (SupportMessage $message) {
                return [
                    'customer_id' => $message->customer_id,
                    'customer_name' => $message->customer?->name ?? 'Unknown',
                    'last_message' => $message->message !== '' ? $message->message : '[Image]',
                    'last_time' => $message->created_at?->diffForHumans(),
                    'staff_id' => $message->staff_id,
                ];
            })
            ->values();
    }

    public function adminMessages(User $viewer, int $customerId, int $perPage = 30): LengthAwarePaginator
    {
        $isAdmin = $viewer->hasRole('admin');

        return SupportMessage::query()
            ->with('sender:id,name')
            ->where('customer_id', $customerId)
            ->when(! $isAdmin, function ($query) use ($viewer) {
                $query->where(function ($q) use ($viewer) {
                    $q->where('staff_id', $viewer->id)->orWhereNull('staff_id');
                });
            })
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'message_page');
    }

    public function messagePayload(LengthAwarePaginator $paginator): array
    {
        // Keep chat UI order from oldest -> newest within the selected page.
        $messages = collect($paginator->items())
            ->reverse()
            ->values()
            ->map(fn (SupportMessage $message) => $this->serializeMessage($message))
            ->all();

        return [
            'messages' => $messages,
            'messagePagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more_pages' => $paginator->hasMorePages(),
            ],
        ];
    }

    private function serializeMessage(SupportMessage $message): array
    {
        return [
            'id' => $message->id,
            'customer_id' => $message->customer_id,
            'staff_id' => $message->staff_id,
            'sender_id' => $message->sender_id,
            'message' => $message->message,
            'seen_at' => $message->seen_at?->toISOString(),
            'created_at' => $message->created_at?->toISOString(),
            'sender' => $message->relationLoaded('sender') && $message->sender
                ? ['id' => $message->sender->id, 'name' => $message->sender->name]
                : null,
            'attachment_url' => $message->attachment_path
                ? Storage::disk('public')->url($message->attachment_path)
                : null,
            'attachment_name' => $message->attachment_name,
            'attachment_mime' => $message->attachment_mime,
            'attachment_size' => $message->attachment_size,
        ];
    }
}
