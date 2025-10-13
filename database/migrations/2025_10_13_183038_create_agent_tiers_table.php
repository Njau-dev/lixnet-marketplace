<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agent_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('min_sales', 10, 2)->default(0);
            $table->decimal('max_sales', 10, 2)->nullable();
            $table->decimal('commission_rate', 5, 2);
            $table->timestamps();
        });

        // Seed base tiers
        DB::table('agent_tiers')->insert([
            ['name' => 'Bronze', 'min_sales' => 0, 'max_sales' => 25000, 'commission_rate' => 10.00],
            ['name' => 'Silver', 'min_sales' => 25000.01, 'max_sales' => 50000, 'commission_rate' => 20.00],
            ['name' => 'Gold', 'min_sales' => 50000.01, 'max_sales' => null, 'commission_rate' => 30.00],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_tiers');
    }
};
