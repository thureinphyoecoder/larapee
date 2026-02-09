<?php

namespace App\Actions\Support;

use App\Models\SupportMessage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StoreSupportMessageAction
{
    public function execute(User $actor, ?int $customerId, ?string $rawMessage, ?UploadedFile $image): SupportMessage
    {
        $cleanMessage = $this->sanitizeMessage($rawMessage);

        if ($cleanMessage === '' && ! $image) {
            throw ValidationException::withMessages([
                'message' => 'Message or image is required.',
            ]);
        }

        return DB::transaction(function () use ($actor, $customerId, $cleanMessage, $image) {
            $isStaff = $actor->hasAnyRole(['admin', 'manager', 'sales']);

            if ($isStaff && (! $customerId || $customerId <= 0)) {
                throw ValidationException::withMessages([
                    'customer_id' => 'Customer is required.',
                ]);
            }

            $resolvedCustomerId = $isStaff ? (int) $customerId : (int) $actor->id;
            $staffId = $isStaff ? (int) $actor->id : $this->resolveStaffIdForCustomer($actor);

            // Claim previously unassigned messages before sending staff reply.
            if ($isStaff) {
                SupportMessage::query()
                    ->where('customer_id', $resolvedCustomerId)
                    ->whereNull('staff_id')
                    ->update(['staff_id' => $staffId]);
            }

            $attachment = $this->storeAttachment($image);

            return SupportMessage::query()->create([
                'customer_id' => $resolvedCustomerId,
                'staff_id' => $staffId,
                'sender_id' => $actor->id,
                'message' => $cleanMessage,
                'attachment_path' => $attachment['path'] ?? null,
                'attachment_name' => $attachment['name'] ?? null,
                'attachment_mime' => $attachment['mime'] ?? null,
                'attachment_size' => $attachment['size'] ?? null,
            ]);
        });
    }

    private function sanitizeMessage(?string $rawMessage): string
    {
        if (! is_string($rawMessage)) {
            return '';
        }

        // Defense in depth: strip any HTML/script payload and normalize whitespace.
        return trim(preg_replace('/\s+/u', ' ', strip_tags($rawMessage)) ?? '');
    }

    private function storeAttachment(?UploadedFile $image): array
    {
        if (! $image) {
            return [];
        }

        $path = $image->storePublicly('support-chat/'.now()->format('Y/m'), 'public');

        return [
            'path' => $path,
            'name' => Str::limit($image->getClientOriginalName(), 180, ''),
            'mime' => $image->getClientMimeType(),
            'size' => $image->getSize(),
        ];
    }

    private function resolveStaffIdForCustomer(User $customer): ?int
    {
        $existingStaffId = SupportMessage::query()
            ->where('customer_id', $customer->id)
            ->whereNotNull('staff_id')
            ->latest('id')
            ->value('staff_id');

        if ($existingStaffId) {
            return (int) $existingStaffId;
        }

        // Deterministic fallback chain keeps assignment behavior predictable.
        $manager = User::role('manager')
            ->when($customer->shop_id, fn ($q) => $q->where('shop_id', $customer->shop_id))
            ->first();

        if ($manager) {
            return $manager->id;
        }

        $admin = User::role('admin')->first();
        if ($admin) {
            return $admin->id;
        }

        $sales = User::role('sales')->first();

        return $sales?->id;
    }
}
