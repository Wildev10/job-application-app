<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationApiTest extends TestCase
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
        ]);

        $token = $company->generateToken();

        return [
            'company' => $company,
            'token' => $token,
        ];
    }

    public function test_store_validates_required_fields(): void
    {
        $auth = $this->createAuthenticatedCompany();

        $response = $this->postJson("/api/applications/{$auth['company']->slug}", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nom', 'email', 'role', 'motivation']);
    }

    public function test_store_creates_application_and_calculates_score_with_uploaded_cv(): void
    {
        Storage::fake('public');
        $auth = $this->createAuthenticatedCompany();

        $payload = [
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'role' => 'dev',
            'motivation' => 'Je suis passionne, motive et j aime les challenges techniques.',
            'portfolio' => 'https://portfolio.example.com',
            'cv' => UploadedFile::fake()->create('cv.pdf', 120, 'application/pdf'),
        ];

        $response = $this->post("/api/applications/{$auth['company']->slug}", $payload);

        $response->assertStatus(201)
            ->assertJsonPath('email', 'jean@example.com')
            ->assertJsonPath('score', 5)
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('status_label', 'En attente')
            ->assertJsonPath('status_color', 'gray');

        $this->assertDatabaseHas('applications', [
            'email' => 'jean@example.com',
            'score' => 5,
            'company_id' => $auth['company']->id,
        ]);

        $storedCvPath = $response->json('cv');
        $this->assertNotNull($storedCvPath);
        Storage::disk('public')->assertExists($storedCvPath);
    }

    public function test_index_can_filter_by_role(): void
    {
        $auth = $this->createAuthenticatedCompany();
        $otherAuth = $this->createAuthenticatedCompany('Sobinco', 'contact@sobinco.bj');

        Application::factory()->count(2)->create([
            'role' => 'dev',
            'company_id' => $auth['company']->id,
        ]);
        Application::factory()->count(3)->create([
            'role' => 'designer',
            'company_id' => $auth['company']->id,
        ]);
        Application::factory()->count(4)->create([
            'role' => 'dev',
            'company_id' => $otherAuth['company']->id,
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->getJson('/api/applications?role=dev');

        $response->assertStatus(200)
            ->assertJsonPath('total', 2)
            ->assertJsonPath('data.0.status', 'pending')
            ->assertJsonPath('data.0.status_label', 'En attente')
            ->assertJsonPath('data.0.status_color', 'gray');

        $roles = collect($response->json('data'))->pluck('role')->unique()->values()->all();
        $this->assertSame(['dev'], $roles);
    }

    public function test_index_can_sort_by_score_descending(): void
    {
        $auth = $this->createAuthenticatedCompany();

        Application::factory()->create(['score' => 1, 'company_id' => $auth['company']->id]);
        Application::factory()->create(['score' => 5, 'company_id' => $auth['company']->id]);
        Application::factory()->create(['score' => 3, 'company_id' => $auth['company']->id]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->getJson('/api/applications?sort=score');

        $response->assertStatus(200);

        $scores = collect($response->json('data'))->pluck('score')->all();
        $this->assertSame([5, 3, 1], $scores);
    }

    public function test_index_is_sorted_by_date_descending_by_default(): void
    {
        $auth = $this->createAuthenticatedCompany();

        $oldest = Application::factory()->create([
            'created_at' => now()->subDays(2),
            'company_id' => $auth['company']->id,
        ]);
        $latest = Application::factory()->create([
            'created_at' => now(),
            'company_id' => $auth['company']->id,
        ]);
        $middle = Application::factory()->create([
            'created_at' => now()->subDay(),
            'company_id' => $auth['company']->id,
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->getJson('/api/applications');

        $response->assertStatus(200)
            ->assertJsonPath('total', 3);

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertSame([$latest->id, $middle->id, $oldest->id], $ids);
    }

    public function test_update_status_validates_status_field(): void
    {
        $auth = $this->createAuthenticatedCompany();
        $application = Application::factory()->create([
            'company_id' => $auth['company']->id,
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson("/api/applications/{$application->id}/status", [
                'status' => 'invalid-status',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Le statut fourni est invalide.')
            ->assertJsonValidationErrors(['status']);
    }

    public function test_update_status_returns_404_when_application_not_found(): void
    {
        $auth = $this->createAuthenticatedCompany();

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson('/api/applications/999999/status', [
                'status' => 'reviewing',
            ]);

        $response->assertStatus(404)
            ->assertJsonPath('message', 'Candidature introuvable.');
    }

    public function test_update_status_updates_application_and_returns_status_payload(): void
    {
        $auth = $this->createAuthenticatedCompany();
        $application = Application::factory()->create([
            'status' => 'pending',
            'company_id' => $auth['company']->id,
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson("/api/applications/{$application->id}/status", [
                'status' => 'interview',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $application->id,
                'status' => 'interview',
                'status_label' => 'Entretien prévu',
                'status_color' => 'yellow',
            ]);

        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'status' => 'interview',
        ]);
    }

    public function test_update_status_returns_403_for_another_company_application(): void
    {
        $auth = $this->createAuthenticatedCompany();
        $otherAuth = $this->createAuthenticatedCompany('Canal+', 'contact@canal.bj');
        $application = Application::factory()->create([
            'company_id' => $otherAuth['company']->id,
            'status' => 'pending',
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson("/api/applications/{$application->id}/status", [
                'status' => 'accepted',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Accès refusé');
    }
}
