<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'is_hero')) {
                $table->boolean('is_hero')->default(false)->after('image_path');
                $table->index('is_hero');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (Schema::hasColumn('products', 'is_hero')) {
                $table->dropIndex(['is_hero']);
                $table->dropColumn('is_hero');
            }
        });
    }
};
