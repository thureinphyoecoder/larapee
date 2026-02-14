<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $this->addIndexIfMissing($table, 'orders', ['shop_id', 'status'], 'orders_shop_id_status_index');
            $this->addIndexIfMissing($table, 'orders', ['shop_id', 'created_at'], 'orders_shop_id_created_at_index');
            $this->addIndexIfMissing($table, 'orders', ['user_id', 'created_at'], 'orders_user_id_created_at_index');
            $this->addIndexIfMissing($table, 'orders', ['delivered_at'], 'orders_delivered_at_index');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $this->addIndexIfMissing($table, 'product_variants', ['product_id', 'is_active'], 'product_variants_product_id_is_active_index');
            $this->addIndexIfMissing($table, 'product_variants', ['product_id', 'price'], 'product_variants_product_id_price_index');
        });

        Schema::table('support_messages', function (Blueprint $table) {
            $this->addIndexIfMissing($table, 'support_messages', ['customer_id', 'id'], 'support_messages_customer_id_id_index');
            $this->addIndexIfMissing($table, 'support_messages', ['staff_id', 'id'], 'support_messages_staff_id_id_index');
            $this->addIndexIfMissing($table, 'support_messages', ['customer_id', 'seen_at'], 'support_messages_customer_id_seen_at_index');
            $this->addIndexIfMissing($table, 'support_messages', ['sender_id', 'seen_at'], 'support_messages_sender_id_seen_at_index');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $this->addIndexIfMissing($table, 'cart_items', ['user_id', 'variant_id'], 'cart_items_user_id_variant_id_index');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $this->addIndexIfMissing($table, 'order_items', ['order_id', 'product_variant_id'], 'order_items_order_id_product_variant_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $this->dropIndexIfExists($table, 'order_items', 'order_items_order_id_product_variant_id_index');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $this->dropIndexIfExists($table, 'cart_items', 'cart_items_user_id_variant_id_index');
        });

        Schema::table('support_messages', function (Blueprint $table) {
            $this->dropIndexIfExists($table, 'support_messages', 'support_messages_customer_id_id_index');
            $this->dropIndexIfExists($table, 'support_messages', 'support_messages_staff_id_id_index');
            $this->dropIndexIfExists($table, 'support_messages', 'support_messages_customer_id_seen_at_index');
            $this->dropIndexIfExists($table, 'support_messages', 'support_messages_sender_id_seen_at_index');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $this->dropIndexIfExists($table, 'product_variants', 'product_variants_product_id_is_active_index');
            $this->dropIndexIfExists($table, 'product_variants', 'product_variants_product_id_price_index');
        });

        Schema::table('orders', function (Blueprint $table) {
            $this->dropIndexIfExists($table, 'orders', 'orders_shop_id_status_index');
            $this->dropIndexIfExists($table, 'orders', 'orders_shop_id_created_at_index');
            $this->dropIndexIfExists($table, 'orders', 'orders_user_id_created_at_index');
            $this->dropIndexIfExists($table, 'orders', 'orders_delivered_at_index');
        });
    }

    private function addIndexIfMissing(Blueprint $table, string $tableName, array $columns, string $indexName): void
    {
        if ($this->indexExists($tableName, $indexName)) {
            return;
        }

        $table->index($columns, $indexName);
    }

    private function dropIndexIfExists(Blueprint $table, string $tableName, string $indexName): void
    {
        if (! $this->indexExists($tableName, $indexName)) {
            return;
        }

        $table->dropIndex($indexName);
    }

    private function indexExists(string $tableName, string $indexName): bool
    {
        $indexes = Schema::getIndexes($tableName);

        foreach ($indexes as $index) {
            if (($index['name'] ?? null) === $indexName) {
                return true;
            }
        }

        return false;
    }
};
