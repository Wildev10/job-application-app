<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use App\Models\Job;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CompanyOnboardingStatusApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Create a company and return its instance with a valid Bearer token.
     *
     * @return array{company: Company, token: string}
     */
    private function createAuthenticatedCompany(string $name = 'Orange Benin', string $email = 'contact@orange.bj'): array
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

    public function test_onboarding_status_returns_new_company_flags_when_no_jobs_exist(): void
    {
        $auth = $this->createAuthenticatedCompany();

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->getJson('/api/company/onboarding-status');

        $response->assertStatus(200)
            ->assertJson([
                'is_new' => true,
                'has_jobs' => false,
                'has_applications' => false,
                'jobs_count' => 0,
                'applications_count' => 0,
                'open_jobs_count' => 0,
                'pending_applications_count' => 0,
            ]);
    }

    public function test_onboarding_status_returns_counts_scoped_to_authenticated_company(): void
    {
        $auth = $this->createAuthenticatedCompany();
        $otherAuth = $this->createAuthenticatedCompany('MTN Benin', 'contact@mtn.bj');

        // Create jobs for the authenticated company.
        $openJob = Job::create([
            'company_id' => $auth['company']->id,
            'title' => 'Backend Developer',
            'slug' => 'backend-developer',
            'description' => 'API et architecture.',
            'role' => 'dev',
            'location' => 'Cotonou',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        Job::create([
            'company_id' => $auth['company']->id,
            'title' => 'Product Designer',
            'slug' => 'product-designer',
            'description' => 'UX/UI.',
            'role' => 'designer',
            'location' => 'Remote',
            'type' => 'full_time',
            'status' => 'closed',
        ]);

        // Add applications for the authenticated company.
        Application::factory()->create([
            'company_id' => $auth['company']->id,
            'job_id' => $openJob->id,
            'status' => 'pending',
        ]);

        Application::factory()->create([
            'company_id' => $auth['company']->id,
            'job_id' => $openJob->id,
            'status' => 'reviewing',
        ]);

        // Create records for another company to validate company-level isolation.
        $otherJob = Job::create([
            'company_id' => $otherAuth['company']->id,
            'title' => 'External Role',
            'slug' => 'external-role',
            'description' => 'Doit etre ignore.',
            'role' => 'dev',
            'location' => 'Porto-Novo',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        Application::factory()->create([
            'company_id' => $otherAuth['company']->id,
            'job_id' => $otherJob->id,
            'status' => 'pending',
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->getJson('/api/company/onboarding-status');

        $response->assertStatus(200)
            ->assertJson([
                'is_new' => false,
                'has_jobs' => true,
                'has_applications' => true,
                'jobs_count' => 2,
                'applications_count' => 2,
                'open_jobs_count' => 1,
                'pending_applications_count' => 1,
            ]);
    }
}
