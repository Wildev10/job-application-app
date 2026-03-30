<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexApplicationsRequest;
use App\Http\Requests\StoreApplicationRequest;
use App\Models\Application;
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
            $validated = $request->validated();
            $query = Application::query();

            $role = $validated['role'] ?? null;
            if (in_array($role, ['dev', 'designer'], true)) {
                $query->where('role', $role);
            }

            $sort = $validated['sort'] ?? 'date';
            if ($sort === 'score') {
                $query->orderByDesc('score');
            } else {
                $query->orderByDesc('created_at');
            }

            $perPage = (int) ($validated['per_page'] ?? 15);
            $applications = $query->paginate($perPage)->appends($validated);

            return response()->json([
                'data' => $applications->items(),
                'meta' => [
                    'current_page' => $applications->currentPage(),
                    'per_page' => $applications->perPage(),
                    'total' => $applications->total(),
                    'last_page' => $applications->lastPage(),
                ],
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'An unexpected server error occurred.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Store a new application and calculate its score.
     */
    public function store(StoreApplicationRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('cv')) {
                $data['cv'] = $request->file('cv')->store('cvs', 'public');
            }

            $data['score'] = $this->scoringService->calculate($data);

            $application = Application::create($data);

            return response()->json([
                'data' => $application,
            ], 201)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'An unexpected server error occurred.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }
}
