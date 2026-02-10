<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->decimal('amount', 12, 2);
            $table->string('reason', 255);
            $table->date('effective_date');
            $table->boolean('is_recurring')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'effective_date']);
        });

        Schema::create('payroll_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('period_month', 7);
            $table->decimal('gross_amount', 12, 2)->default(0);
            $table->decimal('deduction_amount', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->default(0);
            $table->string('status', 20)->default('processed');
            $table->timestamp('paid_at')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'period_month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_payouts');
        Schema::dropIfExists('payroll_adjustments');
    }
};
