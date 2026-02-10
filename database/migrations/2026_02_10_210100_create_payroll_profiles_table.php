<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('base_salary', 12, 2)->default(0);
            $table->decimal('allowance', 12, 2)->default(0);
            $table->decimal('attendance_bonus_per_day', 12, 2)->default(0);
            $table->decimal('absence_deduction_per_day', 12, 2)->default(0);
            $table->decimal('performance_bonus', 12, 2)->default(0);
            $table->date('effective_from')->nullable();
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_profiles');
    }
};
