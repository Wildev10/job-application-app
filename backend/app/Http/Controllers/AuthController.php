<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Cookie;
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
                'message' => 'Les données envoyées sont invalides.',
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
            MailService::sendEmailVerification($company);

            return response()->json([
                'company' => $company,
                'message' => 'Inscription réussie.',
            ], 201)
                ->header('Content-Type', 'application/json')
                ->withCookie(self::makeAuthCookie($token));
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
                'message' => 'Les données envoyées sont invalides.',
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

            if ($company->is_suspended) {
                return response()->json([
                    'message' => 'Ce compte est suspendu.',
                ], 403)->header('Content-Type', 'application/json');
            }

            $token = $company->generateToken();

            return response()->json([
                'company' => $company,
            ], 200)
                ->header('Content-Type', 'application/json')
                ->withCookie(self::makeAuthCookie($token));
        } catch (Throwable) {
            return response()->json([
                'message' => 'Une erreur serveur est survenue.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Mark the company email as verified from a signed link, then go back to the app.
     */
    public function verifyEmail(Request $request, int $id, string $hash): RedirectResponse|JsonResponse
    {
        $company = Company::query()->find($id);

        if ($company === null || ! hash_equals(sha1($company->email), $hash)) {
            return response()->json([
                'message' => 'Lien de vérification invalide.',
            ], 403)->header('Content-Type', 'application/json');
        }

        if ($company->email_verified_at === null) {
            $company->forceFill(['email_verified_at' => now()])->save();
        }

        return redirect(rtrim((string) config('app.frontend_url'), '/').'/login?verified=1');
    }

    /**
     * Send a new verification link to the authenticated company.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        /** @var Company $company */
        $company = $request->attributes->get('company');

        if ($company->email_verified_at !== null) {
            return response()->json([
                'message' => 'Votre email est déjà confirmé.',
            ], 200)->header('Content-Type', 'application/json');
        }

        MailService::sendEmailVerification($company);

        return response()->json([
            'message' => 'Email de confirmation renvoyé.',
        ], 200)->header('Content-Type', 'application/json');
    }

    /**
     * Send a password reset link. Always answers the same way to avoid leaking accounts.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Les données envoyées sont invalides.',
                'errors' => $validator->errors(),
            ], 422)->header('Content-Type', 'application/json');
        }

        $company = Company::where('email', $validator->validated()['email'])->first();

        if ($company !== null) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $company->email],
                ['token' => hash('sha256', $token), 'created_at' => now()]
            );

            MailService::sendPasswordReset($company, $token);
        }

        return response()->json([
            'message' => 'Si un compte existe pour cet email, un lien de réinitialisation vient d\'être envoyé.',
        ], 200)->header('Content-Type', 'application/json');
    }

    /**
     * Set a new password from a valid reset token and revoke the current session token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Les données envoyées sont invalides.',
                'errors' => $validator->errors(),
            ], 422)->header('Content-Type', 'application/json');
        }

        $data = $validator->validated();
        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        $isValid = $record !== null
            && hash_equals((string) $record->token, hash('sha256', $data['token']))
            && now()->subMinutes(60)->lte($record->created_at);

        $company = $isValid ? Company::where('email', $data['email'])->first() : null;

        if ($company === null) {
            return response()->json([
                'message' => 'Ce lien est invalide ou a expiré.',
            ], 422)->header('Content-Type', 'application/json');
        }

        // A reset link proves ownership of the mailbox, so the email counts as verified too.
        $company->forceFill([
            'password' => $data['password'],
            'api_token' => null,
            'email_verified_at' => $company->email_verified_at ?? now(),
        ])->save();

        DB::table('password_reset_tokens')->where('email', $company->email)->delete();

        return response()->json([
            'message' => 'Mot de passe mis à jour. Vous pouvez vous connecter.',
        ], 200)
            ->header('Content-Type', 'application/json')
            ->withCookie(self::clearAuthCookie());
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
        ], 200)
            ->header('Content-Type', 'application/json')
            ->withCookie(self::clearAuthCookie());
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

        $member = $request->attributes->get('member');

        return response()->json([
            'company' => $company,
            'member'  => $member ? ['id' => $member->id, 'name' => $member->name, 'email' => $member->email] : null,
        ], 200)->header('Content-Type', 'application/json');
    }

    private static function makeAuthCookie(string $token): Cookie
    {
        return cookie(
            'company_token',
            $token,
            60 * 24 * 7,   // 7 days in minutes
            '/',
            null,
            app()->environment('production'),  // Secure only in prod
            true,           // HttpOnly
            false,
            'lax',
        );
    }

    private static function clearAuthCookie(): Cookie
    {
        return cookie('company_token', '', -1, '/', null, false, true, false, 'lax');
    }
}
