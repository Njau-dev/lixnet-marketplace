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
        Schema::table('agent_applications', function (Blueprint $table) {
            $table->index('reviewed_by');
        });

        Schema::table('agents', function (Blueprint $table) {
            $table->index('agent_code');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agent_applications', function (Blueprint $table) {
            $table->dropIndex(['reviewed_by']);
        });

        Schema::table('agents', function (Blueprint $table) {
            $table->dropIndex(['agent_code']);
            $table->dropIndex(['is_active']);
        });
    }
};
