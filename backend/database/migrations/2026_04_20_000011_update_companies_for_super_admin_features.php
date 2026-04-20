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
        Schema::table('companies', function (Blueprint $table): void {
            $table->boolean('is_suspended')->default(false)->after('api_token');
            $table->enum('plan', ['starter', 'pro'])->default('starter')->after('is_suspended');
            $table->timestamp('plan_expires_at')->nullable()->after('plan');
            $table->string('impersonate_token')->nullable()->after('plan_expires_at');
            $table->timestamp('impersonate_expires_at')->nullable()->after('impersonate_token');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            $table->dropColumn([
                'is_suspended',
                'plan',
                'plan_expires_at',
                'impersonate_token',
                'impersonate_expires_at',
                'deleted_at',
            ]);
        });
    }
};
