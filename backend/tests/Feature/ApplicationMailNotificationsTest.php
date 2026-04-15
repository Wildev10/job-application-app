<?php

namespace Tests\Feature;

use App\Mail\CandidatureReceivedAdmin;
use App\Mail\CandidatureReceivedApplicant;
use App\Mail\StatusUpdated;
use App\Models\Application;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Group;
use RuntimeException;
use Tests\TestCase;

#[Group('mail')]
class ApplicationMailNotificationsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Create a company and return its instance with a valid Bearer token.
     *
     * @return array{company: Company, token: string}
     */
    private function createAuthenticatedCompany(string $name = 'Vaybe', string $email = 'admin@vaybe.tech'): array
    {
        $company = Company::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('password123'),
            'slug' => Company::generateSlug($name),
            'color' => '#0f766e',
        ]);

        $token = $company->generateToken();

        return [
            'company' => $company,
            'token' => $token,
        ];
    }

    public function test_store_sends_applicant_and_admin_emails(): void
    {
        Mail::fake();
        $auth = $this->createAuthenticatedCompany();

        $response = $this->postJson("/api/applications/{$auth['company']->slug}", [
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'role' => 'dev',
            'motivation' => 'Je suis passionne, motive et j aime les challenges techniques.',
            'portfolio' => 'https://portfolio.example.com',
        ]);

        $response->assertStatus(201);

        Mail::assertSent(CandidatureReceivedApplicant::class, function (CandidatureReceivedApplicant $mail): bool {
            return $mail->application->email === 'jean@example.com';
        });

        Mail::assertSent(CandidatureReceivedAdmin::class, function (CandidatureReceivedAdmin $mail) use ($auth): bool {
            return $mail->company->id === $auth['company']->id;
        });
    }

    public function test_update_status_sends_email_when_status_is_not_pending(): void
    {
        Mail::fake();
        $auth = $this->createAuthenticatedCompany();

        $application = Application::factory()->create([
            'company_id' => $auth['company']->id,
            'status' => 'pending',
            'email' => 'candidate@example.com',
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson("/api/applications/{$application->id}/status", [
                'status' => 'reviewing',
            ]);

        $response->assertStatus(200);

        Mail::assertSent(StatusUpdated::class, function (StatusUpdated $mail) use ($application): bool {
            return $mail->application->id === $application->id && $mail->application->status === 'reviewing';
        });
    }

    public function test_update_status_does_not_send_email_when_status_is_pending(): void
    {
        Mail::fake();
        $auth = $this->createAuthenticatedCompany();

        $application = Application::factory()->create([
            'company_id' => $auth['company']->id,
            'status' => 'reviewing',
            'email' => 'candidate@example.com',
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson("/api/applications/{$application->id}/status", [
                'status' => 'pending',
            ]);

        $response->assertStatus(200);
        Mail::assertNotSent(StatusUpdated::class);
    }

    public function test_store_does_not_fail_when_mail_transport_throws_exception(): void
    {
        $auth = $this->createAuthenticatedCompany();

        Mail::shouldReceive('to->send')
            ->andThrow(new RuntimeException('SMTP unavailable'));
        Log::shouldReceive('error')->once();

        $response = $this->postJson("/api/applications/{$auth['company']->slug}", [
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'role' => 'dev',
            'motivation' => 'Je suis passionne, motive et j aime les challenges techniques.',
            'portfolio' => 'https://portfolio.example.com',
        ]);

        $response->assertStatus(201);
    }

    public function test_update_status_does_not_fail_when_mail_transport_throws_exception(): void
    {
        $auth = $this->createAuthenticatedCompany();
        $application = Application::factory()->create([
            'company_id' => $auth['company']->id,
            'status' => 'pending',
            'email' => 'candidate@example.com',
        ]);

        Mail::shouldReceive('to->send')
            ->andThrow(new RuntimeException('SMTP unavailable'));
        Log::shouldReceive('error')->once();

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson("/api/applications/{$application->id}/status", [
                'status' => 'reviewing',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'reviewing');
    }
}
