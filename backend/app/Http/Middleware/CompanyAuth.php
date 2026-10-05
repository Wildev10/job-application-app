<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompanyAuth
{
    /**
     * Authenticate a company using Bearer token and attach it to the request.
     */
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        $token = $request->bearerToken() ?? $request->cookie('company_token');

        if ($token === null || $token === '') {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        $company = Company::where('api_token', $token)->first();

        if ($company !== null) {
            if ($company->is_suspended) {
                return response()->json([
                    'message' => 'Ce compte est suspendu.',
                ], 403)->header('Content-Type', 'application/json');
            }

            $request->attributes->set('company', $company);

            return $next($request);
        }

        $impersonatedCompany = Company::where('impersonate_token', $token)->first();

        if ($impersonatedCompany !== null) {
            if ($impersonatedCompany->impersonate_expires_at === null || $impersonatedCompany->impersonate_expires_at->lte(now())) {
                return response()->json([
                    'message' => 'Token expiré',
                ], 401)->header('Content-Type', 'application/json');
            }

            $request->attributes->set('company', $impersonatedCompany);

            return $next($request);
        }

        return response()->json([
            'message' => 'Non authentifié',
        ], 401)->header('Content-Type', 'application/json');
    }
}
