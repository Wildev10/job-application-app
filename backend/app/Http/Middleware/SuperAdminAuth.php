<?php

namespace App\Http\Middleware;

use App\Models\SuperAdmin;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminAuth
{
    /**
     * Authenticate a super admin using a Bearer token and attach it to the request.
     */
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        $token = $request->bearerToken();

        if ($token === null || $token === '') {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 401)->header('Content-Type', 'application/json');
        }

        $superAdmin = SuperAdmin::where('api_token', $token)->first();

        if ($superAdmin === null) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 401)->header('Content-Type', 'application/json');
        }

        $request->attributes->set('super_admin', $superAdmin);

        return $next($request);
    }
}
