<?php

namespace App\Services\Governance;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    public function log(
        string $event,
        ?Model $auditable = null,
        array $old = [],
        array $new = [],
        array $meta = [],
        $actor = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
    ): void
    {
        AuditLog::query()->create([
            'actor_id' => $actor?->id,
            'event' => $event,
            'auditable_type' => $auditable?->getMorphClass(),
            'auditable_id' => $auditable?->getKey(),
            'old_values' => $old !== [] ? $old : null,
            'new_values' => $new !== [] ? $new : null,
            'meta' => $meta !== [] ? $meta : null,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'created_at' => now(),
        ]);
    }
}
