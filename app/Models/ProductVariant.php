<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'stock_level',
        'is_active',
        'promo_type',
        'promo_value_type',
        'promo_value',
        'promo_label',
        'promo_starts_at',
        'promo_ends_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'promo_value' => 'decimal:2',
        'promo_starts_at' => 'datetime',
        'promo_ends_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return array{
     *   base_price: float,
     *   final_price: float,
     *   discount_amount: float,
     *   discount_percent: float,
     *   has_promotion: bool,
     *   promotion: array<string, mixed>|null
     * }
     */
    public function resolvePricing(?Carbon $at = null): array
    {
        $at ??= now();
        $basePrice = (float) $this->getRawOriginal('price');
        $promotion = $this->activePromotionMeta($at);

        if (! $promotion) {
            return [
                'base_price' => $basePrice,
                'final_price' => $basePrice,
                'discount_amount' => 0.0,
                'discount_percent' => 0.0,
                'has_promotion' => false,
                'promotion' => null,
            ];
        }

        $value = (float) ($promotion['value'] ?? 0);
        $valueType = (string) ($promotion['value_type'] ?? '');

        $discountAmount = match ($valueType) {
            'percent' => $basePrice * max(0, min(100, $value)) / 100,
            'fixed_amount' => max(0, $value),
            'fixed_price' => max(0, $basePrice - max(0, $value)),
            default => 0.0,
        };

        $finalPrice = max(0, $basePrice - $discountAmount);
        $discountAmount = max(0, $basePrice - $finalPrice);
        $discountPercent = $basePrice > 0 ? ($discountAmount / $basePrice) * 100 : 0.0;

        return [
            'base_price' => $basePrice,
            'final_price' => $finalPrice,
            'discount_amount' => $discountAmount,
            'discount_percent' => $discountPercent,
            'has_promotion' => $discountAmount > 0,
            'promotion' => $discountAmount > 0 ? $promotion : null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function activePromotionMeta(?Carbon $at = null): ?array
    {
        $at ??= now();

        $promoType = strtolower((string) ($this->promo_type ?? ''));
        $valueType = strtolower((string) ($this->promo_value_type ?? ''));
        $value = (float) ($this->promo_value ?? 0);

        if (! in_array($promoType, ['discount', 'flash_sale'], true)) {
            return null;
        }

        if (! in_array($valueType, ['percent', 'fixed_amount', 'fixed_price'], true)) {
            return null;
        }

        if ($value <= 0) {
            return null;
        }

        $startsAt = $this->promo_starts_at instanceof Carbon ? $this->promo_starts_at : null;
        $endsAt = $this->promo_ends_at instanceof Carbon ? $this->promo_ends_at : null;

        if ($startsAt && $at->lt($startsAt)) {
            return null;
        }

        if ($endsAt && $at->gt($endsAt)) {
            return null;
        }

        return [
            'type' => $promoType,
            'label' => trim((string) ($this->promo_label ?: ($promoType === 'flash_sale' ? 'Flash Sale' : 'Discount'))),
            'value_type' => $valueType,
            'value' => $value,
            'starts_at' => $startsAt?->toISOString(),
            'ends_at' => $endsAt?->toISOString(),
        ];
    }
}
