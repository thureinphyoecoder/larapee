<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('payroll_profiles', 'overtime_rate_per_hour')) {
                $table->decimal('overtime_rate_per_hour', 12, 2)->default(0)->after('performance_bonus');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payroll_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('payroll_profiles', 'overtime_rate_per_hour')) {
                $table->dropColumn('overtime_rate_per_hour');
            }
        });
    }
};
