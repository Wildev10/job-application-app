<?php

namespace Tests\Feature;

use App\Mail\StatusUpdated;
use App\Models\Application;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('mail')]
class ApplicationStatusEmailDedupTest extends TestCase
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

    public function test_update_status_does_not_send_email_when_status_is_unchanged(): void
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
                'status' => 'reviewing',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'reviewing');

        Mail::assertNotSent(StatusUpdated::class);
    }
}
