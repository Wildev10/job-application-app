<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\JsonResponse;

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
}
