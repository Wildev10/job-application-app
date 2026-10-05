<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Allow any role (not only dev/designer) so non-tech companies can recruit.
     */
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $table->string('role', 100)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Free-text roles cannot be mapped back to the old enum without data loss.
    }
};
