<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Company;
use App\Services\PlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class DashboardController extends Controller
{
    /**
     * Return company dashboard stats constrained by the active plan.
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            /** @var Company|null $company */
            $company = $request->attributes->get('company');

            if ($company === null) {
                return response()->json([
                    'message' => 'Non authentifié',
                ], 401)->header('Content-Type', 'application/json');
            }

            $planMaxDays = PlanService::getStatsMaxDays($company);
            $daysCount = PlanService::isPro($company) ? 30 : PlanService::STARTER_STATS_DAYS;
            $windowStart = now()->subDays($daysCount - 1)->startOfDay();

            $baseQuery = Application::query()->where('company_id', $company->id);

            $rawHistory = (clone $baseQuery)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', $windowStart)
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->keyBy('date');

            $history = [];
            for ($i = 0; $i < $daysCount; $i++) {
                $date = $windowStart->copy()->addDays($i);
                $dateKey = $date->toDateString();
                $history[] = [
                    'date' => $dateKey,
                    'label' => $date->locale('fr')->translatedFormat('d M'),
                    'count' => (int) data_get($rawHistory->get($dateKey), 'count', 0),
                ];
            }

            return response()->json([
                'applications' => [
                    'total' => (clone $baseQuery)->count(),
                    'this_month' => (clone $baseQuery)->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
                    'this_week' => (clone $baseQuery)->where('created_at', '>=', now()->startOfWeek())->count(),
                ],
                'last_days' => [
                    'days_count' => $daysCount,
                    'max_days_allowed' => $planMaxDays,
                    'data' => $history,
                ],
                'plan_limits' => PlanService::getPlanLimits($company),
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }
}
