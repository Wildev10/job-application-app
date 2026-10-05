<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SuspensionAndPricingTest extends TestCase
{
    use RefreshDatabase;

    private function company(string $name, bool $suspended = false): Company
    {
        return Company::create([
            'name' => $name,
            'email' => Company::generateSlug($name).'@example.com',
            'password' => Hash::make('password123'),
            'slug' => Company::generateSlug($name),
            'is_suspended' => $suspended,
        ]);
    }

    public function test_suspended_company_cannot_login(): void
    {
        $company = $this->company('Suspended Co', true);

        $this->postJson('/api/auth/login', ['email' => $company->email, 'password' => 'password123'])
            ->assertStatus(403);
    }

    public function test_suspended_company_token_is_rejected(): void
    {
        $company = $this->company('Suspended Token Co', true);
        $token = $company->generateToken();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertStatus(403);
    }

    public function test_suspended_company_does_not_accept_applications(): void
    {
        $company = $this->company('Suspended Form Co', true);

        $this->postJson("/api/applications/{$company->slug}", [
            'nom' => 'Jean',
            'email' => 'jean@example.com',
            'role' => 'dev',
            'motivation' => 'Une motivation suffisamment longue pour passer.',
        ])->assertStatus(403);

        $this->assertDatabaseCount('applications', 0);
    }

    public function test_mock_payment_uses_15000_fcfa_price(): void
    {
        config(['fedapay.mock_mode' => true, 'fedapay.mock_auto_approve' => false]);
        $token = $this->company('Pricing Co')->generateToken();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/payments/initiate')
            ->assertOk();

        $payment = Payment::query()->firstOrFail();
        $this->assertSame(15000, $payment->amount);
        $this->assertSame('15 000 FCFA', $payment->amount_formatted);
    }

    public function test_cv_is_private_and_downloadable_only_by_owner(): void
    {
        Storage::fake('local');
        $owner = $this->company('Owner Co');
        $other = $this->company('Other Co');

        $response = $this->postJson("/api/applications/{$owner->slug}", [
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'role' => 'dev',
            'motivation' => 'Une motivation suffisamment longue pour passer.',
            'cv' => UploadedFile::fake()->create('cv.pdf', 50, 'application/pdf'),
        ])->assertStatus(201);

        $id = $response->json('id');
        $ownerToken = $owner->generateToken();
        $otherToken = $other->generateToken();

        $this->get("/api/applications/{$id}/cv")->assertStatus(401);
        $this->withHeader('Authorization', "Bearer {$otherToken}")->get("/api/applications/{$id}/cv")->assertStatus(404);
        $this->withHeader('Authorization', "Bearer {$ownerToken}")->get("/api/applications/{$id}/cv")->assertOk();
    }
}
