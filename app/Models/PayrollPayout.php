<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollPayout extends Model
{
    protected $fillable = [
        'user_id',
        'period_month',
        'gross_amount',
        'deduction_amount',
        'net_amount',
        'status',
        'paid_at',
        'note',
        'processed_by',
    ];

    protected function casts(): array
    {
        return [
            'gross_amount' => 'decimal:2',
            'deduction_amount' => 'decimal:2',
            'net_amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
