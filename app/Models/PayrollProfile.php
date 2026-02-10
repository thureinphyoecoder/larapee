<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollProfile extends Model
{
    protected $fillable = [
        'user_id',
        'base_salary',
        'allowance',
        'attendance_bonus_per_day',
        'absence_deduction_per_day',
        'performance_bonus',
        'overtime_rate_per_hour',
        'effective_from',
    ];

    protected function casts(): array
    {
        return [
            'base_salary' => 'decimal:2',
            'allowance' => 'decimal:2',
            'attendance_bonus_per_day' => 'decimal:2',
            'absence_deduction_per_day' => 'decimal:2',
            'performance_bonus' => 'decimal:2',
            'overtime_rate_per_hour' => 'decimal:2',
            'effective_from' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
