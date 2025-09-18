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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Unique reference for external payments / receipts
            $table->string('order_reference')->unique();

            // Customer info (from checkout form)
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->string('company')->nullable();
            $table->text('notes')->nullable();

            // Payment & status
            $table->decimal('total_amount', 12, 2);
            $table->string('currency', 10)->default('KES');
            $table->enum('status', ['pending', 'paid', 'failed', 'cancelled'])->default('pending');

            // For payment gateway callback
            $table->string('payment_reference')->nullable(); // Pesapal transaction ref
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
