<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexApplicationsRequest;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationStatusRequest;
use App\Models\Application;
use App\Models\Company;
use App\Services\MailService;
use App\Services\ScoringService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;
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
     * Export company applications to a CSV file with optional filters.
     */
    public function export(Request $request): StreamedResponse|JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        // Validate the optional export filters before generating the file.
        $validator = Validator::make($request->query(), [
            'status' => ['nullable', 'in:pending,reviewing,interview,accepted,rejected'],
            'role' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:date_to'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Les filtres d’export sont invalides.',
                'errors' => $validator->errors(),
            ], 422)->header('Content-Type', 'application/json');
        }

        $filters = $validator->validated();

        // Build the export query for the authenticated company only.
        $query = Application::query()
            ->where('company_id', $company->id)
            ->orderByDesc('created_at');

        // Apply the requested status filter when present.
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Apply the requested role filter when present.
        if (! empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        // Apply the starting date filter when present.
        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        // Apply the ending date filter when present.
        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $applications = $query->get();
        $filename = sprintf(
            'candidatures_%s_%s.csv',
            $company->slug,
            now()->format('Y-m-d')
        );

        // Log the export event with the company context, total rows and filters.
        Log::info('Applications exported to CSV.', [
            'company_id' => $company->id,
            'exported_rows' => $applications->count(),
            'filters' => array_filter($filters, static fn (mixed $value): bool => $value !== null && $value !== ''),
        ]);

        // Stream the CSV output manually with a UTF-8 BOM for Excel compatibility.
        return new StreamedResponse(function () use ($applications): void {
            $handle = fopen('php://output', 'wb');

            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");

            // Write the CSV header row in French using the expected column order.
            fputcsv($handle, [
                'ID',
                'Nom',
                'Email',
                'Rôle',
                'Score',
                'Statut',
                'Portfolio',
                'Message de motivation',
                'Date de candidature',
            ]);

            // Write one CSV row per application while normalizing null values and line breaks.
            foreach ($applications as $application) {
                fputcsv($handle, [
                    $application->id,
                    $application->nom,
                    $application->email,
                    $application->role,
                    $application->score,
                    $application->status_label,
                    $application->portfolio ?? '',
                    str_replace(["\r\n", "\r", "\n"], ' ', (string) ($application->motivation ?? '')),
                    optional($application->created_at)->format('Y-m-d H:i:s') ?? '',
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Store a new application and calculate its score.
     */
    public function store(StoreApplicationRequest $request, ?string $slug = null): JsonResponse
    {
        try {
            $resolvedSlug = $slug;

            if ($resolvedSlug === null || $resolvedSlug === '') {
                $resolvedSlug = $request->input('company_slug');
            }

            $company = $this->resolveCompanyForApplication($resolvedSlug);

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

            $application->setRelation('company', $company);
            MailService::sendCandidatureReceived($application);

            return response()->json($application, 201)
                ->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Resolve company for public application submissions.
     */
    private function resolveCompanyForApplication(?string $slug): ?Company
    {
        if ($slug !== null && $slug !== '') {
            return Company::where('slug', $slug)->first();
        }

        $count = Company::query()->count();

        if ($count === 1) {
            return Company::query()->first();
        }

        return null;
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

            $application->setRelation('company', $company);
            MailService::sendStatusUpdated($application);

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
