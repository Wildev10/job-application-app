<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use App\Models\Job;
use App\Services\ScoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RolesLogoAndDetailTest extends TestCase
{
    use RefreshDatabase;

    private function company(string $name): Company
    {
        return Company::create([
            'name' => $name,
            'email' => Company::generateSlug($name).'@example.com',
            'password' => Hash::make('password123'),
            'slug' => Company::generateSlug($name),
        ]);
    }

    private function payload(array $extra = []): array
    {
        return array_merge([
            'nom' => 'Awa Koffi',
            'email' => 'awa@example.com',
            'motivation' => 'Une motivation suffisamment longue pour passer.',
        ], $extra);
    }

    public function test_general_form_accepts_any_role(): void
    {
        $company = $this->company('Role Co');

        $this->postJson("/api/applications/{$company->slug}", $this->payload(['role' => 'Comptable']))
            ->assertStatus(201)
            ->assertJsonPath('role', 'Comptable');
    }

    public function test_general_form_requires_a_role(): void
    {
        $company = $this->company('No Role Co');

        $this->postJson("/api/applications/{$company->slug}", $this->payload())
            ->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_job_application_uses_the_job_role(): void
    {
        $company = $this->company('Job Role Co');
        $job = Job::create([
            'company_id' => $company->id,
            'title' => 'Commercial terrain',
            'slug' => 'commercial-terrain',
            'role' => 'Commercial',
            'status' => 'open',
        ]);

        $this->postJson("/api/applications/{$company->slug}/{$job->slug}", $this->payload())
            ->assertStatus(201)
            ->assertJsonPath('role', 'Commercial')
            ->assertJsonPath('job_id', $job->id);
    }

    public function test_dashboard_filters_on_free_text_role(): void
    {
        $company = $this->company('Filter Co');
        $token = $company->generateToken();
        foreach (['Comptable', 'Commercial'] as $role) {
            Application::create(['company_id' => $company->id, 'nom' => 'X', 'email' => 'x@example.com',
                'role' => $role, 'motivation' => 'texte', 'score' => 1, 'status' => 'pending']);
        }

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/applications?role=Comptable')
            ->assertOk()
            ->assertJsonPath('total', 1);
    }

    public function test_score_does_not_require_a_portfolio(): void
    {
        $score = (new ScoringService)->calculate([
            'email' => 'a@example.com',
            'role' => 'Comptable',
            'cv' => 'cvs/a.pdf',
            'motivation' => str_repeat('Je souhaite rejoindre votre société. ', 8).'Passion.',
        ]);

        $this->assertSame(5, $score);
    }

    public function test_application_detail_is_scoped_to_the_owner(): void
    {
        $owner = $this->company('Detail Owner');
        $other = $this->company('Detail Other');
        $application = Application::create(['company_id' => $owner->id, 'nom' => 'Awa', 'email' => 'awa@example.com',
            'role' => 'Dev', 'motivation' => 'Ma motivation', 'cv' => 'cvs/a.pdf', 'score' => 3, 'status' => 'pending']);
        $ownerToken = $owner->generateToken();
        $otherToken = $other->generateToken();

        $this->withHeader('Authorization', "Bearer {$ownerToken}")
            ->getJson("/api/applications/{$application->id}")
            ->assertOk()
            ->assertJsonPath('motivation', 'Ma motivation')
            ->assertJsonPath('has_cv', true);

        $this->withHeader('Authorization', "Bearer {$otherToken}")
            ->getJson("/api/applications/{$application->id}")
            ->assertStatus(404);
    }

    public function test_company_can_upload_and_remove_a_logo(): void
    {
        Storage::fake('public');
        $company = $this->company('Logo Co');
        $token = $company->generateToken();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->post('/api/company/logo', ['logo' => UploadedFile::fake()->createWithContent('logo.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='))], ['Accept' => 'application/json'])
            ->assertOk();

        $path = $company->fresh()->getRawOriginal('logo');
        Storage::disk('public')->assertExists($path);
        $this->assertStringContainsString($path, $response->json('logo'));
        $this->getJson("/api/company/{$company->slug}")->assertJsonPath('logo', $response->json('logo'));

        $this->withHeader('Authorization', "Bearer {$token}")->deleteJson('/api/company/logo')->assertOk();
        Storage::disk('public')->assertMissing($path);
        $this->assertNull($company->fresh()->logo);
    }

    public function test_logo_rejects_non_images(): void
    {
        $token = $this->company('Bad Logo Co')->generateToken();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->post('/api/company/logo', ['logo' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertStatus(422);
    }
}
