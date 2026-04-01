<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexApplicationsRequest;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationStatusRequest;
use App\Models\Application;
use App\Models\Company;
use App\Services\ScoringService;
use Illuminate\Http\JsonResponse;
use Throwable;

class ApplicationController extends Controller
{
    /**
     * Inject the scoring service used to compute application scores.
     */
    public function __construct(private readonly ScoringService $scoringService)
    {
    }

    /**
     * Display the list of applications with optional filters and sorting.
     */
    public function index(IndexApplicationsRequest $request): JsonResponse
    {
        try {
            /** @var Company|null $company */
            $company = $request->attributes->get('company');

            if ($company === null) {
                return response()->json([
                    'message' => 'Non authentifié',
                ], 401)->header('Content-Type', 'application/json');
            }

            $query = Application::query()->where('company_id', $company->id);

            $role = $request->query('role');
            if (in_array($role, ['dev', 'designer'], true)) {
                $query->where('role', $role);
            }

            $sort = $request->query('sort', 'date');
            if ($sort === 'score') {
                $query->orderByDesc('score');
            } else {
                $query->orderByDesc('created_at');
            }

            $applications = $query->get();

            return response()->json([
                'data' => $applications,
                'total' => $applications->count(),
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Store a new application and calculate its score.
     */
    public function store(StoreApplicationRequest $request, string $slug): JsonResponse
    {
        try {
            $company = Company::where('slug', $slug)->first();

            if ($company === null) {
                return response()->json([
                    'message' => 'Entreprise introuvable.',
                ], 404)->header('Content-Type', 'application/json');
            }

            $data = $request->validated();

            if ($request->hasFile('cv')) {
                $data['cv'] = $request->file('cv')->store('cvs', 'public');
            }

            $data['score'] = $this->scoringService->calculate($data);
            $data['status'] = 'pending';
            $data['company_id'] = $company->id;

            $application = Application::create($data);

            return response()->json($application, 201)
                ->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Update the status of an existing application.
     */
    public function updateStatus(UpdateApplicationStatusRequest $request, int $id): JsonResponse
    {
        try {
            /** @var Company|null $company */
            $company = $request->attributes->get('company');

            if ($company === null) {
                return response()->json([
                    'message' => 'Non authentifié',
                ], 401)->header('Content-Type', 'application/json');
            }

            $application = Application::find($id);

            if ($application === null) {
                return response()->json([
                    'message' => 'Candidature introuvable.',
                ], 404)->header('Content-Type', 'application/json');
            }

            if ($application->company_id !== $company->id) {
                return response()->json([
                    'message' => 'Accès refusé',
                ], 403)->header('Content-Type', 'application/json');
            }

            $application->update([
                'status' => $request->validated('status'),
            ]);

            return response()->json([
                'id' => $application->id,
                'status' => $application->status,
                'status_label' => $application->status_label,
                'status_color' => $application->status_color,
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }
}
