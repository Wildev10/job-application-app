<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Company;
use App\Models\Job;
use Illuminate\Support\Facades\Log;

class PlanService
{
    public const STARTER_MAX_JOBS = 2;

    public const STARTER_MAX_APPLICATIONS_PER_MONTH = 50;

    public const STARTER_STATS_DAYS = 7;

    /**
     * Determine if a company currently has an active Pro plan.
     */
    public static function isPro(Company $company): bool
    {
        if ($company->plan !== 'pro') {
            return false;
        }

        return $company->plan_expires_at === null || $company->plan_expires_at->isFuture();
    }

    /**
     * Determine if a company should be treated as Starter.
     */
    public static function isStarter(Company $company): bool
    {
        return ! self::isPro($company);
    }

    /**
     * Check whether a company can create another active job posting.
     *
     * @return array{allowed: bool, reason?: string, message?: string, upgrade_required?: bool, remaining?: int}
     */
    public static function canCreateJob(Company $company): array
    {
        if (self::isPro($company)) {
            return ['allowed' => true];
        }

        $openJobsCount = Job::query()
            ->where('company_id', $company->id)
            ->where('status', 'open')
            ->count();

        if ($openJobsCount >= self::STARTER_MAX_JOBS) {
            return [
                'allowed' => false,
                'reason' => 'limite_jobs',
                'message' => 'Votre plan Starter est limité à 2 postes actifs simultanément.',
                'upgrade_required' => true,
            ];
        }

        return [
            'allowed' => true,
            'remaining' => self::STARTER_MAX_JOBS - $openJobsCount,
        ];
    }

    /**
     * Check whether a company can receive another application in the current month.
     *
     * @return array{allowed: bool, reason?: string, message?: string, upgrade_required?: bool, remaining?: int}
     */
    public static function canReceiveApplication(Company $company): array
    {
        if (self::isPro($company)) {
            return ['allowed' => true];
        }

        $now = now();

        $applicationsCount = Application::query()
            ->where('company_id', $company->id)
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();

        if ($applicationsCount >= self::STARTER_MAX_APPLICATIONS_PER_MONTH) {
            return [
                'allowed' => false,
                'reason' => 'limite_candidatures',
                'message' => 'Limite de 50 candidatures par mois atteinte sur le plan Starter.',
                'upgrade_required' => true,
            ];
        }

        return [
            'allowed' => true,
            'remaining' => self::STARTER_MAX_APPLICATIONS_PER_MONTH - $applicationsCount,
        ];
    }

    /**
     * Determine if CSV export is available for the company.
     */
    public static function canExportCSV(Company $company): bool
    {
        return self::isPro($company);
    }

    /**
     * Return the maximum dashboard stats window in days for the company plan.
     */
    public static function getStatsMaxDays(Company $company): int
    {
        if (self::isPro($company)) {
            return 90;
        }

        return self::STARTER_STATS_DAYS;
    }

    /**
     * Return a structured summary of limits and plan features for the company.
     *
     * @return array{
     *     plan: string,
     *     is_pro: bool,
     *     jobs: array{limit: int|null, current: int, remaining: int|null},
     *     applications: array{limit: int|null, current_month: int, remaining: int|null},
     *     features: array{export_csv: bool, advanced_stats: bool, unlimited_jobs: bool}
     * }
     */
    public static function getPlanLimits(Company $company): array
    {
        $isPro = self::isPro($company);

        $openJobsCount = Job::query()
            ->where('company_id', $company->id)
            ->where('status', 'open')
            ->count();

        $now = now();
        $applicationsCount = Application::query()
            ->where('company_id', $company->id)
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();

        return [
            'plan' => $isPro ? 'pro' : 'starter',
            'is_pro' => $isPro,
            'jobs' => [
                'limit' => $isPro ? null : self::STARTER_MAX_JOBS,
                'current' => $openJobsCount,
                'remaining' => $isPro ? null : max(0, self::STARTER_MAX_JOBS - $openJobsCount),
            ],
            'applications' => [
                'limit' => $isPro ? null : self::STARTER_MAX_APPLICATIONS_PER_MONTH,
                'current_month' => $applicationsCount,
                'remaining' => $isPro ? null : max(0, self::STARTER_MAX_APPLICATIONS_PER_MONTH - $applicationsCount),
            ],
            'features' => [
                'export_csv' => $isPro,
                'advanced_stats' => $isPro,
                'unlimited_jobs' => $isPro,
            ],
        ];
    }

    /**
     * Automatically close oldest open jobs when a Starter company exceeds allowed limits.
     */
    public static function checkAndDeactivateJobs(Company $company): void
    {
        if (! self::isStarter($company)) {
            return;
        }

        $openJobsCount = Job::query()
            ->where('company_id', $company->id)
            ->where('status', 'open')
            ->count();

        if ($openJobsCount <= self::STARTER_MAX_JOBS) {
            return;
        }

        $toCloseCount = $openJobsCount - self::STARTER_MAX_JOBS;

        $jobIdsToClose = Job::query()
            ->where('company_id', $company->id)
            ->where('status', 'open')
            ->orderBy('created_at')
            ->limit($toCloseCount)
            ->pluck('id');

        if ($jobIdsToClose->isEmpty()) {
            return;
        }

        Job::query()
            ->whereIn('id', $jobIdsToClose)
            ->update(['status' => 'closed']);

        Log::info('Postes en exces desactives pour un compte Starter.', [
            'company_id' => $company->id,
            'deactivated_jobs_count' => $jobIdsToClose->count(),
            'job_ids' => $jobIdsToClose->values()->all(),
        ]);
    }
}
