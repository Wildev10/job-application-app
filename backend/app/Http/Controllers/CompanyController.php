<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCompanyProfileRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
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
            $company->update([
                'name' => $data['name'],
                'color' => $data['color'],
            ]);

            return response()->json([
                'message' => 'Profil entreprise mis à jour.',
                'company' => [
                    'id' => $company->id,
                    'name' => $company->name,
                    'email' => $company->email,
                    'slug' => $company->slug,
                    'logo' => $company->logo,
                    'color' => $company->color,
                ],
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }
}
