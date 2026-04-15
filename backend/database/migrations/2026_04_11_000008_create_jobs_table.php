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
        Schema::create('jobs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('role');
            $table->string('location')->nullable();
            $table->enum('type', ['full_time', 'part_time', 'freelance', 'internship'])->default('full_time');
            $table->enum('status', ['open', 'closed', 'draft'])->default('open');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
