<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\MailService;
use Illuminate\Console\Command;

class SendPlanExpiryReminders extends Command
{
    protected $signature = 'plan:send-expiry-reminders';

    protected $description = 'Send renewal reminder emails to Pro companies expiring in 7 days';

    public function handle(): int
    {
        $target = now()->addDays(7);

        $companies = Company::query()
            ->where('plan', 'pro')
            ->whereNotNull('plan_expires_at')
            ->whereBetween('plan_expires_at', [$target->copy()->startOfDay(), $target->copy()->endOfDay()])
            ->where(function ($q) {
                $q->whereNull('plan_renewal_reminded_at')
                  ->orWhere('plan_renewal_reminded_at', '<', now()->subDays(6));
            })
            ->get();

        foreach ($companies as $company) {
            $daysLeft = (int) now()->diffInDays($company->plan_expires_at, false);
            $daysLeft = max(1, $daysLeft);

            MailService::sendPlanExpiryReminder($company, $daysLeft);

            $company->update(['plan_renewal_reminded_at' => now()]);

            $this->line("Reminder sent to: {$company->email} ({$daysLeft}d left)");
        }

        $this->info("Done. {$companies->count()} reminder(s) sent.");

        return self::SUCCESS;
    }
}
