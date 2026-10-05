<?php

namespace Tests\Feature;

use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class FrenchValidationMessagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_validation_errors_are_in_french(): void
    {
        $company = Company::create([
            'name' => 'Lang Co', 'email' => 'lang@example.com',
            'password' => Hash::make('password123'), 'slug' => 'lang-co',
        ]);

        $response = $this->postJson("/api/applications/{$company->slug}", [
            'nom' => 'Awa', 'email' => 'pas-un-email', 'role' => 'Dev', 'motivation' => 'court',
        ])->assertStatus(422);

        $this->assertSame('Le champ email doit être une adresse email valide.', $response->json('errors.email.0'));
        $this->assertSame('Le champ motivation doit contenir au moins 20 caractères.', $response->json('errors.motivation.0'));
    }

    public function test_register_errors_use_french_field_names(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Nouvelle Co', 'email' => 'x@example.com', 'password' => 'court', 'password_confirmation' => 'autre',
        ])->assertStatus(422);

        $this->assertStringContainsString('mot de passe', implode(' ', $response->json('errors.password')));
    }

    public function test_duplicate_email_message_is_in_french(): void
    {
        Company::create([
            'name' => 'Existing Co', 'email' => 'dup@example.com',
            'password' => Hash::make('password123'), 'slug' => 'existing-co',
        ]);

        $this->postJson('/api/auth/register', [
            'name' => 'Autre Co', 'email' => 'dup@example.com',
            'password' => 'motdepasse123', 'password_confirmation' => 'motdepasse123',
        ])->assertStatus(422)->assertJsonPath('errors.email.0', 'Cette adresse email est déjà utilisée.');
    }
}
