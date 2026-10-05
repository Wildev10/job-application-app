<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use App\Models\Job;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CompanyIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Company $owner;

    private Company $other;

    private string $ownerToken;

    private string $otherToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = $this->makeCompany('Owner Co');
        $this->other = $this->makeCompany('Other Co');
        $this->ownerToken = $this->owner->generateToken();
        $this->otherToken = $this->other->generateToken();
    }

    private function makeCompany(string $name): Company
    {
        return Company::create([
            'name' => $name,
            'email' => Company::generateSlug($name).'@example.com',
            'password' => Hash::make('password123'),
            'slug' => Company::generateSlug($name),
        ]);
    }

    private function ownerJob(): Job
    {
        return Job::create([
            'company_id' => $this->owner->id,
            'title' => 'Comptable',
            'slug' => 'comptable',
            'role' => 'Comptable',
            'status' => 'open',
        ]);
    }

    public function test_jobs_listing_only_contains_own_jobs(): void
    {
        $this->ownerJob();

        $this->withHeader('Authorization', "Bearer {$this->otherToken}")->getJson('/api/jobs')
            ->assertOk()->assertJsonMissing(['title' => 'Comptable']);
        $this->withHeader('Authorization', "Bearer {$this->ownerToken}")->getJson('/api/jobs')
            ->assertOk()->assertJsonFragment(['title' => 'Comptable']);
    }

    public function test_other_company_cannot_read_update_or_delete_a_job(): void
    {
        $job = $this->ownerJob();
        $headers = ['Authorization' => "Bearer {$this->otherToken}"];

        $this->withHeaders($headers)->getJson("/api/jobs/{$job->id}")->assertStatus(403);
        $this->withHeaders($headers)->patchJson("/api/jobs/{$job->id}", ['title' => 'Piraté'])->assertStatus(403);
        $this->withHeaders($headers)->deleteJson("/api/jobs/{$job->id}")->assertStatus(403);

        $this->assertSame('Comptable', $job->fresh()->title);
    }

    public function test_job_routes_require_authentication(): void
    {
        $job = $this->ownerJob();

        $this->getJson('/api/jobs')->assertStatus(401);
        $this->getJson("/api/jobs/{$job->id}")->assertStatus(401);
        $this->postJson('/api/jobs', [])->assertStatus(401);
    }

    public function test_other_company_cannot_filter_applications_by_a_foreign_job(): void
    {
        $job = $this->ownerJob();

        $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->getJson("/api/applications?job_id={$job->id}")->assertStatus(403);
    }

    public function test_other_company_cannot_change_status_of_a_foreign_application(): void
    {
        $application = Application::create(['company_id' => $this->owner->id, 'nom' => 'Awa', 'email' => 'awa@example.com',
            'role' => 'Dev', 'motivation' => 'texte', 'score' => 1, 'status' => 'pending']);

        $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->patchJson("/api/applications/{$application->id}/status", ['status' => 'accepted'])->assertStatus(403);

        $this->assertSame('pending', $application->fresh()->status);
    }

    public function test_applications_and_export_never_leak_across_companies(): void
    {
        Application::create(['company_id' => $this->owner->id, 'nom' => 'Secret Candidate', 'email' => 'secret@example.com',
            'role' => 'Dev', 'motivation' => 'texte', 'score' => 1, 'status' => 'pending']);
        $this->other->update(['plan' => 'pro', 'plan_expires_at' => now()->addMonth()]);

        $this->withHeader('Authorization', "Bearer {$this->otherToken}")->getJson('/api/applications')
            ->assertOk()->assertJsonPath('total', 0);
        $csv = $this->withHeader('Authorization', "Bearer {$this->otherToken}")->get('/api/applications/export');
        $this->assertStringNotContainsString('Secret Candidate', $csv->streamedContent());
    }

    public function test_login_with_wrong_password_is_rejected(): void
    {
        $this->postJson('/api/auth/login', ['email' => $this->owner->email, 'password' => 'mauvais'])->assertStatus(401);
    }

    public function test_logout_invalidates_the_token(): void
    {
        $this->withHeader('Authorization', "Bearer {$this->ownerToken}")->postJson('/api/auth/logout')->assertOk();
        $this->withHeader('Authorization', "Bearer {$this->ownerToken}")->getJson('/api/auth/me')->assertStatus(401);
    }
}
