<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Throwable;

class CompaniesController extends Controller
{
    /**
     * Return a paginated list of companies with filtering, sorting and activity metrics.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'search' => ['nullable', 'string'],
            'plan' => ['nullable', 'string', 'in:starter,pro'],
            'status' => ['nullable', 'string', 'in:active,inactive,suspended'],
            'sort' => ['nullable', 'string', 'in:recent,oldest,most_applications'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation échouée.',
                'errors' => $validator->errors(),
            ], 422)->header('Content-Type', 'application/json');
        }

        try {
            $data = $validator->validated();
            $perPage = (int) ($data['per_page'] ?? 20);
            $thirtyDaysAgo = now()->subDays(30);

            $query = Company::query()
                ->withCount(['jobs', 'applications'])
                ->withMax('applications', 'created_at');

            if (! empty($data['search'])) {
                $search = (string) $data['search'];
                $query->where(function (Builder $builder) use ($search): void {
                    $builder
                        ->where('name', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            }

            if (! empty($data['plan'])) {
                $query->where('plan', $data['plan']);
            }

            if (! empty($data['status'])) {
                if ($data['status'] === 'suspended') {
                    $query->where('is_suspended', true);
                }

                if ($data['status'] === 'active') {
                    $query
                        ->where('is_suspended', false)
                        ->whereHas('applications', static fn (Builder $builder): Builder => $builder->where('created_at', '>=', $thirtyDaysAgo));
                }

                if ($data['status'] === 'inactive') {
                    $query
                        ->where('is_suspended', false)
                        ->whereDoesntHave('applications', static fn (Builder $builder): Builder => $builder->where('created_at', '>=', $thirtyDaysAgo));
                }
            }

            $sort = (string) ($data['sort'] ?? 'recent');
            if ($sort === 'oldest') {
                $query->orderBy('created_at');
            } elseif ($sort === 'most_applications') {
                $query->orderByDesc('applications_count')->orderByDesc('created_at');
            } else {
                $query->orderByDesc('created_at');
            }

            $companies = $query->paginate($perPage)->through(static function (Company $company): array {
                return [
                    'id' => $company->id,
                    'name' => $company->name,
                    'email' => $company->email,
                    'slug' => $company->slug,
                    'plan' => $company->plan,
                    'is_suspended' => (bool) $company->is_suspended,
                    'created_at' => $company->created_at,
                    'jobs_count' => (int) $company->jobs_count,
                    'applications_count' => (int) $company->applications_count,
                    'last_activity_at' => $company->applications_max_created_at,
                ];
            });

            return response()->json($companies, 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Return detailed company information with jobs, application stats and 30-day activity history.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $company = Company::query()->find($id);

            if ($company === null) {
                return response()->json([
                    'message' => 'Entreprise introuvable.',
                ], 404)->header('Content-Type', 'application/json');
            }

            $company->load([
                'jobs' => static fn ($query) => $query->withCount('applications')->orderByDesc('created_at'),
            ]);

            $applicationBaseQuery = Application::query()->where('company_id', $company->id);

            $stats = [
                'total' => (clone $applicationBaseQuery)->count(),
                'pending' => (clone $applicationBaseQuery)->where('status', 'pending')->count(),
                'reviewing' => (clone $applicationBaseQuery)->where('status', 'reviewing')->count(),
                'interview' => (clone $applicationBaseQuery)->where('status', 'interview')->count(),
                'accepted' => (clone $applicationBaseQuery)->where('status', 'accepted')->count(),
                'rejected' => (clone $applicationBaseQuery)->where('status', 'rejected')->count(),
                'this_week' => (clone $applicationBaseQuery)->where('created_at', '>=', now()->startOfWeek())->count(),
                'this_month' => (clone $applicationBaseQuery)->where('created_at', '>=', now()->startOfMonth())->count(),
            ];

            $recentApplications = Application::query()
                ->with('job:id,title,slug')
                ->where('company_id', $company->id)
                ->latest()
                ->limit(5)
                ->get();

            $windowStart = now()->subDays(29)->startOfDay();
            $rawHistory = Application::query()
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('company_id', $company->id)
                ->where('created_at', '>=', $windowStart)
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->keyBy('date');

            $history = [];
            for ($i = 0; $i < 30; $i++) {
                $date = $windowStart->copy()->addDays($i);
                $dateKey = $date->toDateString();
                $history[] = [
                    'date' => $dateKey,
                    'label' => $date->locale('fr')->translatedFormat('d M'),
                    'count' => (int) data_get($rawHistory->get($dateKey), 'count', 0),
                ];
            }

            return response()->json([
                'company' => $company,
                'jobs' => $company->jobs,
                'applications_stats' => $stats,
                'recent_applications' => $recentApplications,
                'activity_last_30_days' => $history,
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Suspend a company account and notify the company by email.
     */
    public function suspend(int $id): JsonResponse
    {
        try {
            $company = Company::query()->find($id);

            if ($company === null) {
                return response()->json([
                    'message' => 'Entreprise introuvable.',
                ], 404)->header('Content-Type', 'application/json');
            }

            $company->forceFill(['is_suspended' => true])->save();

            Mail::raw('Votre compte a été suspendu. Contactez-nous.', static function ($message) use ($company): void {
                $message->to($company->email)->subject('Compte suspendu');
            });

            return response()->json([
                'company' => $company->fresh(),
                'message' => 'Entreprise suspendue.',
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Impossible de suspendre cette entreprise.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Reactivate a suspended company account and notify the company by email.
     */
    public function activate(int $id): JsonResponse
    {
        try {
            $company = Company::query()->find($id);

            if ($company === null) {
                return response()->json([
                    'message' => 'Entreprise introuvable.',
                ], 404)->header('Content-Type', 'application/json');
            }

            $company->forceFill(['is_suspended' => false])->save();

            Mail::raw('Votre compte a été réactivé.', static function ($message) use ($company): void {
                $message->to($company->email)->subject('Compte réactivé');
            });

            return response()->json([
                'company' => $company->fresh(),
                'message' => 'Entreprise réactivée.',
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Impossible de réactiver cette entreprise.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Soft delete a company account without removing related data permanently.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $company = Company::query()->find($id);

            if ($company === null) {
                return response()->json([
                    'message' => 'Entreprise introuvable.',
                ], 404)->header('Content-Type', 'application/json');
            }

            $company->delete();

            return response()->json([
                'message' => 'Entreprise supprimée (suppression douce).',
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Impossible de supprimer cette entreprise.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Generate a temporary impersonation token for a company that expires in one hour.
     */
    public function impersonate(int $id): JsonResponse
    {
        try {
            $company = Company::query()->find($id);

            if ($company === null) {
                return response()->json([
                    'message' => 'Entreprise introuvable.',
                ], 404)->header('Content-Type', 'application/json');
            }

            do {
                $token = Str::random(80);
            } while (Company::where('impersonate_token', $token)->exists());

            $company->forceFill([
                'impersonate_token' => $token,
                'impersonate_expires_at' => now()->addHour(),
            ])->save();

            return response()->json([
                'company_token' => $token,
                'company' => $company->fresh(),
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Impossible de générer un token d\'impersonation.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Update a company plan and notify the company by email.
     */
    public function updatePlan(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'plan' => ['required', 'in:starter,pro'],
            'plan_expires_at' => ['required_if:plan,pro', 'nullable', 'date', 'after:today'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation échouée.',
                'errors' => $validator->errors(),
            ], 422)->header('Content-Type', 'application/json');
        }

        try {
            $company = Company::query()->find($id);

            if ($company === null) {
                return response()->json([
                    'message' => 'Entreprise introuvable.',
                ], 404)->header('Content-Type', 'application/json');
            }

            $data = $validator->validated();
            $nextPlan = (string) $data['plan'];

            $updates = [
                'plan' => $nextPlan,
                'plan_expires_at' => $nextPlan === 'pro' ? $data['plan_expires_at'] : null,
            ];

            $company->forceFill($updates)->save();

            $mailMessage = $nextPlan === 'pro'
                ? '🎉 Votre compte a été upgradé vers le plan Pro !'
                : 'Votre compte a été rétrogradé vers le plan Starter.';

            Mail::raw($mailMessage, static function ($message) use ($company): void {
                $message->to($company->email)->subject('Mise à jour de votre plan');
            });

            return response()->json([
                'company' => $company->fresh(),
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Impossible de mettre à jour le plan de cette entreprise.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }
}
