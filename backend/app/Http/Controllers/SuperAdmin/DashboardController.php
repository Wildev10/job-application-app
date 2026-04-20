<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Throwable;

class DashboardController extends Controller
{
    /**
     * Return super admin global metrics and 30-day evolution series.
     */
    public function stats(): JsonResponse
    {
        try {
            $now = now();
            $monthStart = $now->copy()->startOfMonth();
            $weekStart = $now->copy()->startOfWeek();
            $thirtyDaysAgo = $now->copy()->subDays(30);
            $windowStart = $now->copy()->subDays(29)->startOfDay();
            $windowEnd = $now->copy()->endOfDay();

            // Query 1: companies with activity counters and last activity in a single Eloquent statement.
            $companies = Company::query()
                ->select(['id', 'plan', 'created_at'])
                ->withCount('applications')
                ->withMax('applications', 'created_at')
                ->get();

            // Query 2: applications reduced to fields needed for all aggregate calculations.
            $applications = Application::query()
                ->select(['company_id', 'created_at'])
                ->get();

            $totalCompanies = $companies->count();
            $totalApplications = (int) $companies->sum('applications_count');

            $activeCompaniesThisMonth = $applications
                ->filter(static fn (Application $application): bool => $application->created_at !== null
                    && $application->created_at->gte($monthStart))
                ->pluck('company_id')
                ->filter()
                ->unique()
                ->count();

            $newCompaniesThisWeek = $companies
                ->filter(static fn (Company $company): bool => $company->created_at !== null
                    && $company->created_at->gte($weekStart))
                ->count();

            $applicationsThisMonth = $applications
                ->filter(static fn (Application $application): bool => $application->created_at !== null
                    && $application->created_at->gte($monthStart))
                ->count();

            $applicationsThisWeek = $applications
                ->filter(static fn (Application $application): bool => $application->created_at !== null
                    && $application->created_at->gte($weekStart))
                ->count();

            $companiesWithZeroActivity = $companies
                ->filter(static fn (Company $company): bool => (int) $company->applications_count === 0)
                ->count();

            $companiesInactive30Days = $companies
                ->filter(static function (Company $company) use ($thirtyDaysAgo): bool {
                    $lastActivity = $company->applications_max_created_at;

                    return $lastActivity === null || Carbon::parse($lastActivity)->lte($thirtyDaysAgo);
                })
                ->count();

            $starterCount = $companies
                ->filter(static fn (Company $company): bool => $company->plan === 'starter')
                ->count();

            $proCount = $companies
                ->filter(static fn (Company $company): bool => $company->plan === 'pro')
                ->count();

            $avgApplicationsPerCompany = $totalCompanies > 0
                ? round($totalApplications / $totalCompanies, 2)
                : 0.0;

            $conversionRate = $totalCompanies > 0
                ? round(($proCount / $totalCompanies) * 100, 2)
                : 0.0;

            $registrationsLast30Days = $this->buildDailySeries($windowStart, $companies, 'created_at');
            $applicationsLast30Days = $this->buildDailySeries($windowStart, $applications, 'created_at');

            return response()->json([
                'total_companies' => $totalCompanies,
                'active_companies_this_month' => $activeCompaniesThisMonth,
                'new_companies_this_week' => $newCompaniesThisWeek,
                'total_applications' => $totalApplications,
                'applications_this_month' => $applicationsThisMonth,
                'applications_this_week' => $applicationsThisWeek,
                'avg_applications_per_company' => $avgApplicationsPerCompany,
                'companies_with_zero_activity' => $companiesWithZeroActivity,
                'companies_inactive_30_days' => $companiesInactive30Days,
                'starter_count' => $starterCount,
                'pro_count' => $proCount,
                'conversion_rate' => $conversionRate,
                'registrations_last_30_days' => $registrationsLast30Days,
                'applications_last_30_days' => $applicationsLast30Days,
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Build a 30-day daily series with French abbreviated labels from a collection.
     *
     * @param Collection<int, mixed> $items
     * @return array<int, array{date: string, label: string, count: int}>
     */
    private function buildDailySeries(Carbon $startDate, Collection $items, string $dateField): array
    {
        $endDate = $startDate->copy()->addDays(29)->endOfDay();

        $countByDate = $items
            ->filter(static fn ($item): bool => data_get($item, $dateField) !== null)
            ->map(static fn ($item): string => Carbon::parse((string) data_get($item, $dateField))->toDateString())
            ->filter(static fn (string $date): bool => Carbon::parse($date)->betweenIncluded($startDate, $endDate))
            ->countBy();

        $series = [];

        for ($i = 0; $i < 30; $i++) {
            $date = $startDate->copy()->addDays($i);
            $dateKey = $date->toDateString();
            $series[] = [
                'date' => $dateKey,
                'label' => $date->locale('fr')->translatedFormat('d M'),
                'count' => (int) ($countByDate[$dateKey] ?? 0),
            ];
        }

        return $series;
    }
}
