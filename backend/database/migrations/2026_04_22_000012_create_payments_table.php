<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('fedapay_transaction_id')->nullable()->unique();
            $table->string('fedapay_customer_id')->nullable();
            $table->integer('amount');
            $table->string('currency')->default('XOF');
            $table->enum('status', ['pending', 'approved', 'canceled', 'declined', 'refunded'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('plan')->default('pro');
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('company_id');
            $table->index('status');
            $table->index('fedapay_transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
