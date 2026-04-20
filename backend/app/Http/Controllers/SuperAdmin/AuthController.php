<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SuperAdmin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Throwable;

class AuthController extends Controller
{
    /**
     * Authenticate a super admin and return a fresh token.
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
            $superAdmin = SuperAdmin::where('email', $data['email'])->first();

            if ($superAdmin === null || ! Hash::check($data['password'], $superAdmin->password)) {
                return response()->json([
                    'message' => 'Identifiants incorrects',
                ], 401)->header('Content-Type', 'application/json');
            }

            $token = $superAdmin->generateToken();

            return response()->json([
                'super_admin' => [
                    'id' => $superAdmin->id,
                    'name' => $superAdmin->name,
                    'email' => $superAdmin->email,
                ],
                'token' => $token,
                'message' => 'Connexion réussie',
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Revoke the authenticated super admin token.
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var SuperAdmin|null $superAdmin */
        $superAdmin = $request->attributes->get('super_admin');

        if ($superAdmin === null) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 401)->header('Content-Type', 'application/json');
        }

        try {
            $superAdmin->forceFill(['api_token' => null])->save();

            return response()->json([
                'message' => 'Déconnecté',
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Return the authenticated super admin profile.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var SuperAdmin|null $superAdmin */
        $superAdmin = $request->attributes->get('super_admin');

        if ($superAdmin === null) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 401)->header('Content-Type', 'application/json');
        }

        return response()->json([
            'super_admin' => [
                'id' => $superAdmin->id,
                'name' => $superAdmin->name,
                'email' => $superAdmin->email,
                'last_login_at' => $superAdmin->last_login_at,
            ],
        ], 200)->header('Content-Type', 'application/json');
    }
}
