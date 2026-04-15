<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class JobController extends Controller
{
    /**
     * Display all jobs for the authenticated company with application counts.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        $jobs = Job::query()
            ->where('company_id', $company->id)
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $jobs,
            'total' => $jobs->count(),
        ], 200)->header('Content-Type', 'application/json');
    }

    /**
     * Store a new job for the authenticated company.
     */
    public function store(Request $request): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'role' => ['required', 'string'],
            'location' => ['nullable', 'string'],
            'type' => ['required', 'in:full_time,part_time,freelance,internship'],
            'expires_at' => ['nullable', 'date', 'after:today'],
        ]);

        $data['slug'] = $this->generateUniqueSlug($company->id, $data['title']);
        $data['status'] = 'open';
        $data['company_id'] = $company->id;

        $job = Job::create($data);

        return response()->json($job, 201)->header('Content-Type', 'application/json');
    }

    /**
     * Show one job and its applications for the authenticated company.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        $job = Job::query()->with(['applications'])->find($id);

        if ($job === null) {
            return response()->json([
                'message' => 'Poste introuvable.',
            ], 404)->header('Content-Type', 'application/json');
        }

        if ($job->company_id !== $company->id) {
            return response()->json([
                'message' => 'Accès refusé',
            ], 403)->header('Content-Type', 'application/json');
        }

        return response()->json($job, 200)->header('Content-Type', 'application/json');
    }

    /**
     * Update one job for the authenticated company.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        $job = Job::query()->find($id);

        if ($job === null) {
            return response()->json([
                'message' => 'Poste introuvable.',
            ], 404)->header('Content-Type', 'application/json');
        }

        if ($job->company_id !== $company->id) {
            return response()->json([
                'message' => 'Accès refusé',
            ], 403)->header('Content-Type', 'application/json');
        }

        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'role' => ['sometimes', 'required', 'string'],
            'location' => ['sometimes', 'nullable', 'string'],
            'type' => ['sometimes', 'required', 'in:full_time,part_time,freelance,internship'],
            'expires_at' => ['sometimes', 'nullable', 'date', 'after:today'],
        ]);

        if (array_key_exists('title', $data) && $data['title'] !== $job->title) {
            $data['slug'] = $this->generateUniqueSlug($company->id, $data['title'], $job->id);
        }

        $job->update($data);

        return response()->json($job->fresh(), 200)->header('Content-Type', 'application/json');
    }

    /**
     * Close a job for the authenticated company instead of deleting it.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        $job = Job::query()->find($id);

        if ($job === null) {
            return response()->json([
                'message' => 'Poste introuvable.',
            ], 404)->header('Content-Type', 'application/json');
        }

        if ($job->company_id !== $company->id) {
            return response()->json([
                'message' => 'Accès refusé',
            ], 403)->header('Content-Type', 'application/json');
        }

        $job->update(['status' => 'closed']);

        return response()->json([
            'message' => 'Poste clôturé avec succès',
        ], 200)->header('Content-Type', 'application/json');
    }

    /**
     * Show the public details of one open and non-expired job.
     */
    public function showPublic(string $companySlug, string $jobSlug): JsonResponse
    {
        $job = Job::query()
            ->select(['id', 'company_id', 'title', 'description', 'role', 'location', 'type', 'expires_at'])
            ->where('slug', $jobSlug)
            ->open()
            ->whereHas('company', function ($query) use ($companySlug): void {
                $query->where('slug', $companySlug);
            })
            ->with(['company:id,name,logo,color'])
            ->first();

        if ($job === null) {
            return response()->json([
                'message' => 'Poste introuvable.',
            ], 404)->header('Content-Type', 'application/json');
        }

        return response()->json([
            'title' => $job->title,
            'description' => $job->description,
            'role' => $job->role,
            'location' => $job->location,
            'type_label' => $job->type_label,
            'expires_at' => $job->expires_at,
            'company' => [
                'name' => $job->company?->name,
                'logo' => $job->company?->logo,
                'color' => $job->company?->color,
            ],
        ], 200)->header('Content-Type', 'application/json');
    }

    /**
     * Build a unique slug per company from a title.
     */
    private function generateUniqueSlug(int $companyId, string $title, ?int $ignoreJobId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $suffix = 2;

        while ($this->slugExistsForCompany($companyId, $slug, $ignoreJobId)) {
            $slug = sprintf('%s-%d', $baseSlug, $suffix);
            $suffix++;
        }

        return $slug;
    }

    /**
     * Determine whether a slug already exists for a company.
     */
    private function slugExistsForCompany(int $companyId, string $slug, ?int $ignoreJobId = null): bool
    {
        $query = Job::query()
            ->where('company_id', $companyId)
            ->where('slug', $slug);

        if ($ignoreJobId !== null) {
            $query->where('id', '!=', $ignoreJobId);
        }

        return $query->exists();
    }
}
