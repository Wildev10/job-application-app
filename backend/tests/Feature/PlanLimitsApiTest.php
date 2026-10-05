<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use App\Models\Job;
use App\Models\SuperAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PlanLimitsApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Create a company and return its instance with an API token.
     *
     * @return array{company: Company, token: string}
     */
    private function createAuthenticatedCompany(
        string $name = 'Starter Company',
        string $email = 'starter@example.com',
        string $plan = 'starter',
        mixed $planExpiresAt = null,
    ): array {
        $company = Company::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('password123'),
            'slug' => Company::generateSlug($name),
            'plan' => $plan,
            'plan_expires_at' => $planExpiresAt,
        ]);

        $token = $company->generateToken();

        return [
            'company' => $company,
            'token' => $token,
        ];
    }

    /**
     * Create a super admin and return its bearer token.
     */
    private function createAuthenticatedSuperAdmin(): string
    {
        $admin = SuperAdmin::create([
            'name' => 'Root',
            'email' => 'root@example.com',
            'password' => Hash::make('password123'),
        ]);

        return $admin->generateToken();
    }

    public function test_starter_company_cannot_create_more_than_two_open_jobs(): void
    {
        $auth = $this->createAuthenticatedCompany();

        Job::create([
            'company_id' => $auth['company']->id,
            'title' => 'Poste 1',
            'slug' => 'poste-1',
            'description' => 'desc',
            'role' => 'dev',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        Job::create([
            'company_id' => $auth['company']->id,
            'title' => 'Poste 2',
            'slug' => 'poste-2',
            'description' => 'desc',
            'role' => 'dev',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->postJson('/api/jobs', [
                'title' => 'Poste 3',
                'description' => 'desc',
                'role' => 'dev',
                'type' => 'full_time',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('reason', 'limite_jobs')
            ->assertJsonPath('upgrade_required', true)
            ->assertJsonPath('current_plan', 'starter')
            ->assertJsonPath('message', 'Votre plan Starter est limité à 2 postes actifs simultanément.');
    }

    public function test_starter_company_cannot_receive_more_than_fifty_applications_per_month(): void
    {
        $auth = $this->createAuthenticatedCompany('Limit Apps Co', 'apps@example.com');

        Application::factory()->count(50)->create([
            'company_id' => $auth['company']->id,
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        $response = $this->postJson("/api/applications/{$auth['company']->slug}", [
            'nom' => 'Candidat Externe',
            'email' => 'candidate@example.com',
            'role' => 'dev',
            'motivation' => 'Je souhaite rejoindre votre équipe.',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Ce formulaire n\'accepte plus de candidatures pour le moment.')
            ->assertJsonPath('reason', 'limite_candidatures')
            ->assertJsonPath('upgrade_required', true);
    }

    public function test_starter_company_cannot_export_csv(): void
    {
        $auth = $this->createAuthenticatedCompany('Export Locked Co', 'export@example.com');

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->getJson('/api/applications/export');

        $response->assertStatus(403)
            ->assertJsonPath('message', 'L\'export CSV est disponible uniquement sur le plan Pro.')
            ->assertJsonPath('upgrade_required', true)
            ->assertJsonPath('current_plan', 'starter');
    }

    public function test_company_plan_status_returns_plan_limits_summary(): void
    {
        $auth = $this->createAuthenticatedCompany('Plan Status Co', 'plan@example.com');

        Job::create([
            'company_id' => $auth['company']->id,
            'title' => 'Poste actif',
            'slug' => 'poste-actif',
            'description' => 'desc',
            'role' => 'dev',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        Application::factory()->count(3)->create([
            'company_id' => $auth['company']->id,
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->getJson('/api/company/plan-status');

        $response->assertStatus(200)
            ->assertJsonPath('plan', 'starter')
            ->assertJsonPath('is_pro', false)
            ->assertJsonPath('jobs.limit', 2)
            ->assertJsonPath('jobs.current', 1)
            ->assertJsonPath('jobs.remaining', 1)
            ->assertJsonPath('applications.limit', 50)
            ->assertJsonPath('applications.current_month', 3)
            ->assertJsonPath('applications.remaining', 47)
            ->assertJsonPath('features.export_csv', false)
            ->assertJsonPath('features.advanced_stats', false)
            ->assertJsonPath('features.unlimited_jobs', false);
    }

    public function test_super_admin_can_update_company_plan(): void
    {
        $token = $this->createAuthenticatedSuperAdmin();
        $companyAuth = $this->createAuthenticatedCompany('Plan Update Co', 'plan-update@example.com');

        $upgradeResponse = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/superadmin/companies/{$companyAuth['company']->id}/plan", [
                'plan' => 'pro',
                'plan_expires_at' => now()->addMonth()->toDateString(),
            ]);

        $upgradeResponse->assertStatus(200)
            ->assertJsonPath('company.plan', 'pro');

        $this->assertDatabaseHas('companies', [
            'id' => $companyAuth['company']->id,
            'plan' => 'pro',
        ]);

        $downgradeResponse = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/superadmin/companies/{$companyAuth['company']->id}/plan", [
                'plan' => 'starter',
            ]);

        $downgradeResponse->assertStatus(200)
            ->assertJsonPath('company.plan', 'starter')
            ->assertJsonPath('company.plan_expires_at', null);

        $this->assertDatabaseHas('companies', [
            'id' => $companyAuth['company']->id,
            'plan' => 'starter',
            'plan_expires_at' => null,
        ]);
    }
}
