<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCompanyProfileRequest;
use App\Models\Company;
use App\Services\PlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Throwable;

class CompanyController extends Controller
{
    /**
     * Return public company branding information by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $company = Company::query()
            ->select(['id', 'name', 'slug', 'logo', 'color'])
            ->where('slug', $slug)
            ->first();

        if ($company === null) {
            return response()->json([
                'message' => 'Entreprise introuvable.',
            ], 404)->header('Content-Type', 'application/json');
        }

        return response()->json($company, 200)->header('Content-Type', 'application/json');
    }

    /**
     * Update authenticated company profile settings.
     */
    public function updateProfile(UpdateCompanyProfileRequest $request): JsonResponse
    {
        try {
            /** @var Company|null $company */
            $company = $request->attributes->get('company');

            if ($company === null) {
                return response()->json([
                    'message' => 'Non authentifié',
                ], 401)->header('Content-Type', 'application/json');
            }

            $data = $request->validated();
            $updates = [];

            if (array_key_exists('name', $data) && $data['name'] !== $company->name) {
                $nextSlug = Company::generateSlug($data['name']);
                $slugAlreadyTaken = Company::query()
                    ->where('slug', $nextSlug)
                    ->where('id', '!=', $company->id)
                    ->exists();

                if ($slugAlreadyTaken) {
                    return response()->json([
                        'message' => 'Le slug généré pour ce nom est déjà utilisé par une autre entreprise.',
                    ], 409)->header('Content-Type', 'application/json');
                }

                $updates['name'] = $data['name'];
                $updates['slug'] = $nextSlug;
            }

            if (array_key_exists('color', $data)) {
                $updates['color'] = $data['color'];
            }

            if ($updates !== []) {
                $company->update($updates);
                $company->refresh();
            }

            return response()->json([
                'message' => 'Profil entreprise mis à jour.',
                'company' => Arr::except($company->toArray(), ['password', 'api_token']),
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Return onboarding indicators for the authenticated company.
     */
    public function onboardingStatus(Request $request): JsonResponse
    {
        try {
            /** @var Company|null $company */
            $company = $request->attributes->get('company');

            if ($company === null) {
                return response()->json([
                    'message' => 'Non authentifié',
                ], 401)->header('Content-Type', 'application/json');
            }

            // Load all onboarding counters in a single query scoped to this company.
            $company->loadCount([
                'jobs',
                'applications',
                'jobs as open_jobs_count' => static fn ($query) => $query->where('status', 'open'),
                'applications as pending_applications_count' => static fn ($query) => $query->where('status', 'pending'),
            ]);

            $jobsCount = (int) $company->jobs_count;
            $applicationsCount = (int) $company->applications_count;
            $openJobsCount = (int) $company->open_jobs_count;
            $pendingApplicationsCount = (int) $company->pending_applications_count;

            return response()->json([
                'is_new' => $jobsCount === 0,
                'has_jobs' => $jobsCount > 0,
                'has_applications' => $applicationsCount > 0,
                'jobs_count' => $jobsCount,
                'applications_count' => $applicationsCount,
                'open_jobs_count' => $openJobsCount,
                'pending_applications_count' => $pendingApplicationsCount,
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Return current plan limits for the authenticated company.
     */
    public function planStatus(Request $request): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        return response()->json(PlanService::getPlanLimits($company), 200)
            ->header('Content-Type', 'application/json');
    }
}
