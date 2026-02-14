<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['shop_id', 'status'], 'orders_shop_id_status_index');
            $table->index(['shop_id', 'created_at'], 'orders_shop_id_created_at_index');
            $table->index(['user_id', 'created_at'], 'orders_user_id_created_at_index');
            $table->index(['delivered_at'], 'orders_delivered_at_index');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->index(['product_id', 'is_active'], 'product_variants_product_id_is_active_index');
            $table->index(['product_id', 'price'], 'product_variants_product_id_price_index');
        });

        Schema::table('support_messages', function (Blueprint $table) {
            $table->index(['customer_id', 'id'], 'support_messages_customer_id_id_index');
            $table->index(['staff_id', 'id'], 'support_messages_staff_id_id_index');
            $table->index(['customer_id', 'seen_at'], 'support_messages_customer_id_seen_at_index');
            $table->index(['sender_id', 'seen_at'], 'support_messages_sender_id_seen_at_index');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->index(['user_id', 'variant_id'], 'cart_items_user_id_variant_id_index');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index(['order_id', 'product_variant_id'], 'order_items_order_id_product_variant_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_order_id_product_variant_id_index');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropIndex('cart_items_user_id_variant_id_index');
        });

        Schema::table('support_messages', function (Blueprint $table) {
            $table->dropIndex('support_messages_customer_id_id_index');
            $table->dropIndex('support_messages_staff_id_id_index');
            $table->dropIndex('support_messages_customer_id_seen_at_index');
            $table->dropIndex('support_messages_sender_id_seen_at_index');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropIndex('product_variants_product_id_is_active_index');
            $table->dropIndex('product_variants_product_id_price_index');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_shop_id_status_index');
            $table->dropIndex('orders_shop_id_created_at_index');
            $table->dropIndex('orders_user_id_created_at_index');
            $table->dropIndex('orders_delivered_at_index');
        });
    }
};
