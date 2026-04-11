<?php

namespace Tests\Feature;

use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CompanyProfileApiTest extends TestCase
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

    public function test_update_profile_updates_only_the_provided_color(): void
    {
        $auth = $this->createAuthenticatedCompany();

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson('/api/company/profile', [
                'color' => '#2563eb',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('company.name', 'Orange Benin')
            ->assertJsonPath('company.slug', 'orange-benin')
            ->assertJsonPath('company.color', '#2563eb');

        $this->assertDatabaseHas('companies', [
            'id' => $auth['company']->id,
            'name' => 'Orange Benin',
            'slug' => 'orange-benin',
            'color' => '#2563eb',
        ]);
    }

    public function test_update_profile_regenerates_slug_when_name_changes(): void
    {
        $auth = $this->createAuthenticatedCompany();

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson('/api/company/profile', [
                'name' => 'Orange Business',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('company.name', 'Orange Business')
            ->assertJsonPath('company.slug', 'orange-business')
            ->assertJsonMissingPath('company.password')
            ->assertJsonMissingPath('company.api_token');

        $this->assertDatabaseHas('companies', [
            'id' => $auth['company']->id,
            'name' => 'Orange Business',
            'slug' => 'orange-business',
        ]);
    }

    public function test_update_profile_returns_conflict_when_generated_slug_is_taken(): void
    {
        $auth = $this->createAuthenticatedCompany();

        Company::create([
            'name' => 'Orange Business',
            'email' => 'other@orange.bj',
            'password' => Hash::make('password123'),
            'slug' => 'orange-business',
            'color' => '#ef4444',
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson('/api/company/profile', [
                'name' => 'Orange Business',
            ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Le slug généré pour ce nom est déjà utilisé par une autre entreprise.');
    }

    public function test_update_profile_validates_color_format(): void
    {
        $auth = $this->createAuthenticatedCompany();

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->patchJson('/api/company/profile', [
                'color' => 'blue',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Les informations du profil sont invalides.')
            ->assertJsonValidationErrors(['color']);
    }
}
