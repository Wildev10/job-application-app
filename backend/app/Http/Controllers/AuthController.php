<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Throwable;

class AuthController extends Controller
{
    /**
     * Register a new company account and return an API token.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:companies,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422)->header('Content-Type', 'application/json');
        }

        try {
            $data = $validator->validated();
            $baseSlug = Company::generateSlug($data['name']);
            $slug = $baseSlug;
            $suffix = 2;

            while (Company::where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$suffix;
                $suffix++;
            }

            $company = Company::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'slug' => $slug,
            ]);

            $token = $company->generateToken();

            return response()->json([
                'company' => $company,
                'api_token' => $token,
                'message' => 'Inscription réussie.',
            ], 201)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Authenticate a company and issue a fresh API token.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422)->header('Content-Type', 'application/json');
        }

        try {
            $data = $validator->validated();
            $company = Company::where('email', $data['email'])->first();

            if ($company === null || ! Hash::check($data['password'], $company->password)) {
                return response()->json([
                    'message' => 'Identifiants incorrects',
                ], 401)->header('Content-Type', 'application/json');
            }

            $token = $company->generateToken();

            return response()->json([
                'company' => $company,
                'api_token' => $token,
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Revoke the current company API token.
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        $company->forceFill(['api_token' => null])->save();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ], 200)->header('Content-Type', 'application/json');
    }

    /**
     * Return the currently authenticated company profile.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        return response()->json([
            'company' => $company,
        ], 200)->header('Content-Type', 'application/json');
    }
}
