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
        Schema::create('agent_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Personal Details
            $table->string('full_name');
            $table->date('date_of_birth');
            $table->string('phone_number');
            $table->text('physical_address');
            $table->enum('id_type', ['National ID', 'Passport']);
            $table->string('id_number');
            $table->string('id_document_path'); // URL/path to uploaded file

            // University Details
            $table->string('university_name');
            $table->string('campus');
            $table->string('student_id');
            $table->string('course');
            $table->string('year_of_study');
            $table->string('university_email');
            $table->string('student_id_document_path'); // URL/path to uploaded file

            // Application metadata
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('terms_accepted')->default(true);

            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_applications');
    }
};
