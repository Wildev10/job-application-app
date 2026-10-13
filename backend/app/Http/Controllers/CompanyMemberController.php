<?php

namespace App\Http\Controllers;

use App\Mail\MemberInviteMail;
use App\Models\Company;
use App\Models\CompanyMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie;

class CompanyMemberController extends Controller
{
    /**
     * List all members of the authenticated company.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var Company $company */
        $company = $request->attributes->get('company');

        $members = CompanyMember::query()
            ->where('company_id', $company->id)
            ->select(['id', 'email', 'name', 'status', 'created_at'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $members], 200)
            ->header('Content-Type', 'application/json');
    }

    /**
     * Invite a new member to the company.
     */
    public function invite(Request $request): JsonResponse
    {
        /** @var Company $company */
        $company = $request->attributes->get('company');

        // Only the company owner (not a member) can invite.
        if ($request->attributes->get('member') !== null) {
            return response()->json(['message' => 'Seul le propriétaire peut inviter des membres.'], 403)
                ->header('Content-Type', 'application/json');
        }

        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        // Don't allow inviting the company owner's own email.
        if (strtolower($data['email']) === strtolower($company->email)) {
            return response()->json(['message' => 'Cet email est celui du propriétaire du compte.'], 422)
                ->header('Content-Type', 'application/json');
        }

        $existing = CompanyMember::query()
            ->where('company_id', $company->id)
            ->where('email', $data['email'])
            ->first();

        if ($existing !== null) {
            if ($existing->status === 'active') {
                return response()->json(['message' => 'Ce membre fait déjà partie de l\'équipe.'], 422)
                    ->header('Content-Type', 'application/json');
            }

            // Re-invite: regenerate the token and resend.
            $existing->forceFill(['invite_token' => Str::random(64)])->save();
            $member = $existing;
        } else {
            $member = CompanyMember::create([
                'company_id'   => $company->id,
                'email'        => $data['email'],
                'invite_token' => Str::random(64),
                'status'       => 'pending',
            ]);
        }

        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/');
        $acceptUrl = "{$frontendUrl}/member/accept/{$member->invite_token}";

        Mail::to($member->email)->queue(new MemberInviteMail($member, $company, $acceptUrl));

        return response()->json([
            'message' => 'Invitation envoyée.',
            'member'  => ['id' => $member->id, 'email' => $member->email, 'status' => $member->status],
        ], 201)->header('Content-Type', 'application/json');
    }

    /**
     * Remove a member from the company.
     */
    public function remove(Request $request, int $id): JsonResponse
    {
        /** @var Company $company */
        $company = $request->attributes->get('company');

        if ($request->attributes->get('member') !== null) {
            return response()->json(['message' => 'Seul le propriétaire peut retirer des membres.'], 403)
                ->header('Content-Type', 'application/json');
        }

        $member = CompanyMember::query()
            ->where('id', $id)
            ->where('company_id', $company->id)
            ->first();

        if ($member === null) {
            return response()->json(['message' => 'Membre introuvable.'], 404)
                ->header('Content-Type', 'application/json');
        }

        $member->delete();

        return response()->json(['message' => 'Membre retiré.'], 200)
            ->header('Content-Type', 'application/json');
    }

    /**
     * Return invite info for the accept page (public).
     */
    public function showInvite(string $token): JsonResponse
    {
        $member = CompanyMember::query()
            ->where('invite_token', $token)
            ->where('status', 'pending')
            ->with('company:id,name,logo,color')
            ->first();

        if ($member === null) {
            return response()->json(['message' => 'Invitation invalide ou déjà utilisée.'], 404)
                ->header('Content-Type', 'application/json');
        }

        return response()->json([
            'email'   => $member->email,
            'company' => $member->company,
        ], 200)->header('Content-Type', 'application/json');
    }

    /**
     * Activate a pending invite by setting name + password.
     */
    public function activateInvite(Request $request, string $token): JsonResponse
    {
        $member = CompanyMember::query()
            ->where('invite_token', $token)
            ->where('status', 'pending')
            ->with('company')
            ->first();

        if ($member === null) {
            return response()->json(['message' => 'Invitation invalide ou déjà utilisée.'], 404)
                ->header('Content-Type', 'application/json');
        }

        $data = $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $apiToken = $member->forceFill([
            'name'     => $data['name'],
            'password' => Hash::make($data['password']),
            'status'   => 'active',
        ])->save() ? null : null;

        $member->refresh();
        $apiToken = $member->generateToken();

        /** @var Company $company */
        $company = $member->company;

        return response()->json([
            'member'  => ['id' => $member->id, 'name' => $member->name, 'email' => $member->email],
            'company' => $company,
        ], 200)
            ->header('Content-Type', 'application/json')
            ->withCookie(self::makeAuthCookie($apiToken));
    }

    /**
     * Log in a company member.
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $member = CompanyMember::query()
            ->where('email', $data['email'])
            ->where('status', 'active')
            ->with('company')
            ->first();

        if ($member === null || ! Hash::check($data['password'], $member->password)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401)
                ->header('Content-Type', 'application/json');
        }

        /** @var Company $company */
        $company = $member->company;

        if ($company === null || $company->is_suspended) {
            return response()->json(['message' => 'Ce compte est suspendu.'], 403)
                ->header('Content-Type', 'application/json');
        }

        $apiToken = $member->generateToken();

        return response()->json([
            'member'  => ['id' => $member->id, 'name' => $member->name, 'email' => $member->email],
            'company' => $company,
        ], 200)
            ->header('Content-Type', 'application/json')
            ->withCookie(self::makeAuthCookie($apiToken));
    }

    /**
     * Log out the current member (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var CompanyMember|null $member */
        $member = $request->attributes->get('member');

        if ($member !== null) {
            $member->forceFill(['api_token' => null])->save();
        }

        return response()->json(['message' => 'Déconnecté.'], 200)
            ->header('Content-Type', 'application/json')
            ->withCookie(self::clearAuthCookie());
    }

    private static function makeAuthCookie(string $token): Cookie
    {
        return cookie('company_token', $token, 60 * 24 * 7, '/', null,
            app()->environment('production'), true, false, 'lax');
    }

    private static function clearAuthCookie(): Cookie
    {
        return cookie('company_token', '', -1, '/', null, false, true, false, 'lax');
    }
}
