<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ApplicationExportTest extends TestCase
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
            'plan' => 'pro',
            'plan_expires_at' => now()->addMonth(),
        ]);

        $token = $company->generateToken();

        return [
            'company' => $company,
            'token' => $token,
        ];
    }

    public function test_export_returns_csv_with_bom_headers_and_rows(): void
    {
        Log::spy();
        $auth = $this->createAuthenticatedCompany();

        Application::factory()->create([
            'company_id' => $auth['company']->id,
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'role' => 'dev',
            'score' => 5,
            'status' => 'reviewing',
            'portfolio' => null,
            'motivation' => "Motivation ligne 1\nMotivation ligne 2",
            'created_at' => now()->setDate(2026, 4, 11)->setTime(10, 30, 0),
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->get('/api/applications/export');

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $response->assertHeader(
            'content-disposition',
            'attachment; filename="candidatures_orange-benin_'.now()->format('Y-m-d').'.csv"'
        );

        $content = $response->streamedContent();

        $this->assertStringStartsWith("\xEF\xBB\xBF", $content);

        $rows = array_map('str_getcsv', preg_split("/\r\n|\n|\r/", trim(substr($content, 3))));

        $this->assertSame([
            'ID',
            'Nom',
            'Email',
            'Rôle',
            'Score',
            'Statut',
            'Portfolio',
            'Message de motivation',
            'Date de candidature',
        ], $rows[0]);

        $this->assertSame('Jean Dupont', $rows[1][1]);
        $this->assertSame('En cours d\'examen', $rows[1][5]);
        $this->assertSame('', $rows[1][6]);
        $this->assertSame('Motivation ligne 1 Motivation ligne 2', $rows[1][7]);
        $this->assertSame('2026-04-11 10:30:00', $rows[1][8]);

        Log::shouldHaveReceived('info')->once();
    }

    public function test_export_applies_status_role_and_date_filters(): void
    {
        $auth = $this->createAuthenticatedCompany();

        Application::factory()->create([
            'company_id' => $auth['company']->id,
            'role' => 'dev',
            'status' => 'reviewing',
            'nom' => 'Profil retenu',
            'created_at' => '2026-04-09 12:00:00',
        ]);

        Application::factory()->create([
            'company_id' => $auth['company']->id,
            'role' => 'designer',
            'status' => 'reviewing',
            'nom' => 'Mauvais role',
            'created_at' => '2026-04-09 12:00:00',
        ]);

        Application::factory()->create([
            'company_id' => $auth['company']->id,
            'role' => 'dev',
            'status' => 'accepted',
            'nom' => 'Mauvais statut',
            'created_at' => '2026-04-09 12:00:00',
        ]);

        Application::factory()->create([
            'company_id' => $auth['company']->id,
            'role' => 'dev',
            'status' => 'reviewing',
            'nom' => 'Mauvaise date',
            'created_at' => '2026-04-01 12:00:00',
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->get('/api/applications/export?status=reviewing&role=dev&date_from=2026-04-08&date_to=2026-04-10');

        $response->assertOk();

        $rows = array_map('str_getcsv', preg_split("/\r\n|\n|\r/", trim(substr($response->streamedContent(), 3))));

        $this->assertCount(2, $rows);
        $this->assertSame('Profil retenu', $rows[1][1]);
    }

    public function test_export_returns_headers_only_when_no_application_matches_filters(): void
    {
        $auth = $this->createAuthenticatedCompany();

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->get('/api/applications/export?status=accepted');

        $response->assertOk();

        $rows = array_map('str_getcsv', preg_split("/\r\n|\n|\r/", trim(substr($response->streamedContent(), 3))));

        $this->assertCount(1, $rows);
        $this->assertSame('ID', $rows[0][0]);
    }

    public function test_export_validates_invalid_filters(): void
    {
        $auth = $this->createAuthenticatedCompany();

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->getJson('/api/applications/export?status=wrong&date_from=2026-04-11&date_to=2026-04-10');

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Les filtres d’export sont invalides.')
            ->assertJsonValidationErrors(['status', 'date_from', 'date_to']);
    }
}
