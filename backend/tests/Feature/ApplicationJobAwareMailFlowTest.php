<?php

namespace Tests\Feature;

use App\Mail\CandidatureReceivedAdmin;
use App\Mail\CandidatureReceivedApplicant;
use App\Mail\StatusUpdated;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('mail')]
class ApplicationJobAwareMailFlowTest extends TestCase
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

    public function test_job_aware_application_flow_sends_expected_emails(): void
    {
        Mail::fake();

        $auth = $this->createAuthenticatedCompany('Job Mail QA', 'job-mail@example.com');

        $jobResponse = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->postJson('/api/jobs', [
                'title' => 'Developpeur Full Stack QA',
                'description' => 'Poste test QA mail',
                'role' => 'dev',
                'location' => 'Remote',
                'type' => 'full_time',
            ]);

        $jobResponse->assertStatus(201)
            ->assertJsonPath('title', 'Developpeur Full Stack QA');

        $jobId = (int) $jobResponse->json('id');
        $jobSlug = (string) $jobResponse->json('slug');

        $applicationResponse = $this->postJson("/api/applications/{$auth['company']->slug}/{$jobSlug}", [
            'nom' => 'Jeanne QA',
            'email' => 'jeanne.qa@example.com',
            'role' => 'dev',
            'motivation' => 'Je suis motivee et passionnee pour contribuer a ce poste en equipe.',
            'portfolio' => 'https://portfolio.example.com',
        ]);

        $applicationResponse->assertStatus(201)
            ->assertJsonPath('job_id', $jobId)
            ->assertJsonPath('status', 'pending');

        $applicationId = (int) $applicationResponse->json('id');

        Mail::assertSent(CandidatureReceivedApplicant::class, function (CandidatureReceivedApplicant $mail) use ($applicationId): bool {
            return $mail->application->id === $applicationId
                && $mail->application->job_id !== null
                && $mail->application->email === 'jeanne.qa@example.com';
        });

        Mail::assertSent(CandidatureReceivedAdmin::class, function (CandidatureReceivedAdmin $mail) use ($auth, $applicationId): bool {
            return $mail->company->id === $auth['company']->id
                && $mail->application->id === $applicationId
                && $mail->application->job_id !== null;
        });

        $statusResponse = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson("/api/applications/{$applicationId}/status", [
                'status' => 'interview',
            ]);

        $statusResponse->assertStatus(200)
            ->assertJsonPath('status', 'interview');

        Mail::assertSent(StatusUpdated::class, function (StatusUpdated $mail) use ($applicationId): bool {
            return $mail->application->id === $applicationId
                && $mail->application->status === 'interview';
        });
    }
}
