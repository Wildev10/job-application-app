<?php

namespace Tests\Feature;

use App\Models\Application;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_validates_required_fields(): void
    {
        $response = $this->postJson('/api/applications', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nom', 'email', 'role', 'motivation']);
    }

    public function test_store_creates_application_and_calculates_score_with_uploaded_cv(): void
    {
        Storage::fake('public');

        $payload = [
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'role' => 'dev',
            'motivation' => 'Je suis passionne, motive et j aime les challenges techniques.',
            'portfolio' => 'https://portfolio.example.com',
            'cv' => UploadedFile::fake()->create('cv.pdf', 120, 'application/pdf'),
        ];

        $response = $this->post('/api/applications', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('email', 'jean@example.com')
            ->assertJsonPath('score', 5)
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('status_label', 'En attente')
            ->assertJsonPath('status_color', 'gray');

        $this->assertDatabaseHas('applications', [
            'email' => 'jean@example.com',
            'score' => 5,
        ]);

        $storedCvPath = $response->json('cv');
        $this->assertNotNull($storedCvPath);
        Storage::disk('public')->assertExists($storedCvPath);
    }

    public function test_index_can_filter_by_role(): void
    {
        Application::factory()->count(2)->create(['role' => 'dev']);
        Application::factory()->count(3)->create(['role' => 'designer']);

        $response = $this->getJson('/api/applications?role=dev');

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
        Application::factory()->create(['score' => 1]);
        Application::factory()->create(['score' => 5]);
        Application::factory()->create(['score' => 3]);

        $response = $this->getJson('/api/applications?sort=score');

        $response->assertStatus(200);

        $scores = collect($response->json('data'))->pluck('score')->all();
        $this->assertSame([5, 3, 1], $scores);
    }

    public function test_index_is_sorted_by_date_descending_by_default(): void
    {
        $oldest = Application::factory()->create(['created_at' => now()->subDays(2)]);
        $latest = Application::factory()->create(['created_at' => now()]);
        $middle = Application::factory()->create(['created_at' => now()->subDay()]);

        $response = $this->getJson('/api/applications');

        $response->assertStatus(200)
            ->assertJsonPath('total', 3);

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertSame([$latest->id, $middle->id, $oldest->id], $ids);
    }

    public function test_update_status_validates_status_field(): void
    {
        $application = Application::factory()->create();

        $response = $this->patchJson("/api/applications/{$application->id}/status", [
            'status' => 'invalid-status',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Le statut fourni est invalide.')
            ->assertJsonValidationErrors(['status']);
    }

    public function test_update_status_returns_404_when_application_not_found(): void
    {
        $response = $this->patchJson('/api/applications/999999/status', [
            'status' => 'reviewing',
        ]);

        $response->assertStatus(404)
            ->assertJsonPath('message', 'Candidature introuvable.');
    }

    public function test_update_status_updates_application_and_returns_status_payload(): void
    {
        $application = Application::factory()->create(['status' => 'pending']);

        $response = $this->patchJson("/api/applications/{$application->id}/status", [
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
}
