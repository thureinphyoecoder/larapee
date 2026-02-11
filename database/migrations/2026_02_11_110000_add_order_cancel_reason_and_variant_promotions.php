<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'cancel_reason')) {
                $table->text('cancel_reason')->nullable()->after('return_reason');
            }

            if (! Schema::hasColumn('orders', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable()->after('cancel_reason');
            }
        });

        Schema::table('product_variants', function (Blueprint $table) {
            if (! Schema::hasColumn('product_variants', 'promo_type')) {
                $table->string('promo_type', 20)->nullable()->after('is_active');
            }

            if (! Schema::hasColumn('product_variants', 'promo_value_type')) {
                $table->string('promo_value_type', 20)->nullable()->after('promo_type');
            }

            if (! Schema::hasColumn('product_variants', 'promo_value')) {
                $table->decimal('promo_value', 12, 2)->nullable()->after('promo_value_type');
            }

            if (! Schema::hasColumn('product_variants', 'promo_label')) {
                $table->string('promo_label', 80)->nullable()->after('promo_value');
            }

            if (! Schema::hasColumn('product_variants', 'promo_starts_at')) {
                $table->timestamp('promo_starts_at')->nullable()->after('promo_label');
            }

            if (! Schema::hasColumn('product_variants', 'promo_ends_at')) {
                $table->timestamp('promo_ends_at')->nullable()->after('promo_starts_at');
            }

        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            if (Schema::hasColumn('product_variants', 'promo_ends_at')) {
                $table->dropColumn('promo_ends_at');
            }

            if (Schema::hasColumn('product_variants', 'promo_starts_at')) {
                $table->dropColumn('promo_starts_at');
            }

            if (Schema::hasColumn('product_variants', 'promo_label')) {
                $table->dropColumn('promo_label');
            }

            if (Schema::hasColumn('product_variants', 'promo_value')) {
                $table->dropColumn('promo_value');
            }

            if (Schema::hasColumn('product_variants', 'promo_value_type')) {
                $table->dropColumn('promo_value_type');
            }

            if (Schema::hasColumn('product_variants', 'promo_type')) {
                $table->dropColumn('promo_type');
            }

        });

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'cancelled_at')) {
                $table->dropColumn('cancelled_at');
            }

            if (Schema::hasColumn('orders', 'cancel_reason')) {
                $table->dropColumn('cancel_reason');
            }
        });
    }
};
