<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('jobs') && ! Schema::hasColumn('jobs', 'company_id')) {
            Schema::rename('jobs', 'queue_jobs');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('queue_jobs') && ! Schema::hasTable('jobs')) {
            Schema::rename('queue_jobs', 'jobs');
        }
    }
};
