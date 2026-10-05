<?php

namespace Tests\Feature;

use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class PasswordResetAndEmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function company(string $email = 'rh@example.com'): Company
    {
        return Company::create([
            'name' => 'Reset Co',
            'email' => $email,
            'password' => Hash::make('ancien-mdp-123'),
            'slug' => Company::generateSlug('Reset Co '.$email),
        ]);
    }

    public function test_register_sends_a_verification_email_and_starts_unverified(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/register', [
            'name' => 'Nouvelle Co',
            'email' => 'new@example.com',
            'password' => 'motdepasse123',
            'password_confirmation' => 'motdepasse123',
        ])->assertStatus(201)->assertJsonPath('company.email_verified_at', null);

        Mail::assertSent(VerifyEmailMail::class, fn ($mail) => $mail->hasTo('new@example.com'));
    }

    public function test_signed_link_verifies_the_email(): void
    {
        $company = $this->company();
        $url = URL::temporarySignedRoute('verification.verify', now()->addDay(), [
            'id' => $company->id, 'hash' => sha1($company->email),
        ]);

        $this->get($url)->assertRedirect(rtrim((string) config('app.frontend_url'), '/').'/login?verified=1');
        $this->assertNotNull($company->fresh()->email_verified_at);
    }

    public function test_unsigned_or_tampered_link_is_rejected(): void
    {
        $company = $this->company();

        $this->getJson("/api/auth/verify-email/{$company->id}/".sha1($company->email))->assertStatus(403);
        $this->assertNull($company->fresh()->email_verified_at);
    }

    public function test_resend_verification_requires_login_and_sends_mail(): void
    {
        Mail::fake();
        $company = $this->company();
        $token = $company->generateToken();

        $this->postJson('/api/auth/resend-verification')->assertStatus(401);
        $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/auth/resend-verification')->assertOk();

        Mail::assertSent(VerifyEmailMail::class, 1);
    }

    public function test_forgot_password_answers_the_same_for_unknown_emails(): void
    {
        Mail::fake();
        $this->company();

        $known = $this->postJson('/api/auth/forgot-password', ['email' => 'rh@example.com'])->assertOk();
        $unknown = $this->postJson('/api/auth/forgot-password', ['email' => 'ghost@example.com'])->assertOk();

        $this->assertSame($known->json('message'), $unknown->json('message'));
        Mail::assertSent(ResetPasswordMail::class, 1);
    }

    public function test_reset_password_with_valid_token_changes_password_and_revokes_session(): void
    {
        Mail::fake();
        $company = $this->company();
        $oldToken = $company->generateToken();

        $this->postJson('/api/auth/forgot-password', ['email' => $company->email]);
        $token = null;
        Mail::assertSent(ResetPasswordMail::class, function (ResetPasswordMail $mail) use (&$token) {
            parse_str((string) parse_url($mail->resetUrl, PHP_URL_QUERY), $query);
            $token = $query['token'];

            return true;
        });

        $this->postJson('/api/auth/reset-password', [
            'email' => $company->email,
            'token' => $token,
            'password' => 'nouveau-mdp-456',
            'password_confirmation' => 'nouveau-mdp-456',
        ])->assertOk();

        $this->assertTrue(Hash::check('nouveau-mdp-456', $company->fresh()->password));
        $this->withHeader('Authorization', "Bearer {$oldToken}")->getJson('/api/auth/me')->assertStatus(401);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $company->email]);

        // The token is single use.
        $this->postJson('/api/auth/reset-password', [
            'email' => $company->email, 'token' => $token,
            'password' => 'autre-mdp-789', 'password_confirmation' => 'autre-mdp-789',
        ])->assertStatus(422);
    }

    public function test_reset_password_rejects_wrong_or_expired_token(): void
    {
        $company = $this->company();
        DB::table('password_reset_tokens')->insert([
            'email' => $company->email,
            'token' => hash('sha256', 'bon-token'),
            'created_at' => now()->subMinutes(61),
        ]);
        $payload = ['email' => $company->email, 'password' => 'nouveau-mdp-456', 'password_confirmation' => 'nouveau-mdp-456'];

        $this->postJson('/api/auth/reset-password', $payload + ['token' => 'mauvais'])->assertStatus(422);
        $this->postJson('/api/auth/reset-password', $payload + ['token' => 'bon-token'])->assertStatus(422);
        $this->assertTrue(Hash::check('ancien-mdp-123', $company->fresh()->password));
    }
}
