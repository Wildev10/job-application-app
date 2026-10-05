<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_members', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('name')->nullable();
            $table->string('password')->nullable();
            $table->string('api_token', 60)->nullable()->unique();
            $table->string('invite_token', 64)->unique();
            $table->enum('status', ['pending', 'active'])->default('pending');
            $table->timestamps();

            $table->unique(['company_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_members');
    }
};
