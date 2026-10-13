<?php

namespace App\Console\Commands;

use App\Models\Application;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class ArchiveOldApplications extends Command
{
    protected $signature = 'applications:archive {--days=30 : Number of days after which to archive}';
    protected $description = 'Archive accepted and rejected applications older than the given number of days';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = Carbon::now()->subDays($days);

        $count = Application::query()
            ->whereIn('status', ['accepted', 'rejected'])
            ->whereNull('archived_at')
            ->where('updated_at', '<', $cutoff)
            ->update(['archived_at' => Carbon::now()]);

        $this->info("Archived {$count} application(s) older than {$days} days.");

        return self::SUCCESS;
    }
}
