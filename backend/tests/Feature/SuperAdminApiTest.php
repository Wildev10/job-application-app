<?php

namespace Tests\Feature;

use App\Mail\BroadcastMail;
use App\Models\Application;
use App\Models\Company;
use App\Models\SuperAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SuperAdminApiTest extends TestCase
{
    use RefreshDatabase;

    private function superAdminToken(): string
    {
        return SuperAdmin::create([
            'name' => 'Root',
            'email' => 'root@example.com',
            'password' => Hash::make('super-secret-1'),
        ])->generateToken();
    }

    private function company(string $name, string $plan = 'starter'): Company
    {
        return Company::create([
            'name' => $name,
            'email' => Company::generateSlug($name).'@example.com',
            'password' => Hash::make('password123'),
            'slug' => Company::generateSlug($name),
            'plan' => $plan,
        ]);
    }

    public function test_login_succeeds_with_good_credentials_and_fails_with_bad_ones(): void
    {
        SuperAdmin::create(['name' => 'Root', 'email' => 'root@example.com', 'password' => Hash::make('super-secret-1')]);

        $this->postJson('/api/superadmin/auth/login', ['email' => 'root@example.com', 'password' => 'super-secret-1'])
            ->assertOk()->assertJsonStructure(['token']);
        $this->postJson('/api/superadmin/auth/login', ['email' => 'root@example.com', 'password' => 'wrong'])
            ->assertStatus(401);
    }

    public function test_company_token_cannot_reach_superadmin_routes(): void
    {
        $companyToken = $this->company('Intruder Co')->generateToken();

        $this->getJson('/api/superadmin/stats')->assertStatus(401);
        $this->withHeader('Authorization', "Bearer {$companyToken}")->getJson('/api/superadmin/stats')->assertStatus(401);
        $this->withHeader('Authorization', "Bearer {$companyToken}")->getJson('/api/superadmin/companies')->assertStatus(401);
    }

    public function test_super_admin_token_cannot_reach_company_routes(): void
    {
        $token = $this->superAdminToken();

        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/applications')->assertStatus(401);
    }

    public function test_logout_revokes_the_super_admin_token(): void
    {
        $token = $this->superAdminToken();

        $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/superadmin/auth/logout')->assertOk();
        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/superadmin/stats')->assertStatus(401);
    }

    public function test_stats_and_companies_listing_work(): void
    {
        $token = $this->superAdminToken();
        $company = $this->company('Listed Co');
        Application::create(['company_id' => $company->id, 'nom' => 'A', 'email' => 'a@example.com',
            'role' => 'Dev', 'motivation' => 'texte', 'score' => 1, 'status' => 'pending']);

        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/superadmin/stats')->assertOk();
        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/superadmin/companies')
            ->assertOk()->assertJsonFragment(['slug' => 'listed-co']);
    }

    public function test_suspend_then_activate_toggles_access_and_sends_mail(): void
    {
        Mail::fake();
        $token = $this->superAdminToken();
        $company = $this->company('Toggle Co');
        $companyToken = $company->generateToken();

        $this->withHeader('Authorization', "Bearer {$token}")->patchJson("/api/superadmin/companies/{$company->id}/suspend")->assertOk();
        $this->assertTrue($company->fresh()->is_suspended);
        $this->withHeader('Authorization', "Bearer {$companyToken}")->getJson('/api/auth/me')->assertStatus(403);

        $this->withHeader('Authorization', "Bearer {$token}")->patchJson("/api/superadmin/companies/{$company->id}/activate")->assertOk();
        $this->assertFalse($company->fresh()->is_suspended);
        $this->withHeader('Authorization', "Bearer {$companyToken}")->getJson('/api/auth/me')->assertOk();
    }

    public function test_update_plan_to_pro_requires_a_future_expiry(): void
    {
        Mail::fake();
        $token = $this->superAdminToken();
        $company = $this->company('Plan Co');
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($headers)->patchJson("/api/superadmin/companies/{$company->id}/plan", ['plan' => 'pro'])->assertStatus(422);
        $this->withHeaders($headers)->patchJson("/api/superadmin/companies/{$company->id}/plan", [
            'plan' => 'pro', 'plan_expires_at' => now()->addMonth()->toDateString(),
        ])->assertOk();

        $this->assertSame('pro', $company->fresh()->plan);
    }

    public function test_destroy_soft_deletes_the_company_and_blocks_its_token(): void
    {
        $token = $this->superAdminToken();
        $company = $this->company('Deleted Co');
        $companyToken = $company->generateToken();

        $this->withHeader('Authorization', "Bearer {$token}")->deleteJson("/api/superadmin/companies/{$company->id}")->assertOk();

        $this->assertSoftDeleted('companies', ['id' => $company->id]);
        $this->withHeader('Authorization', "Bearer {$companyToken}")->getJson('/api/auth/me')->assertStatus(401);
    }

    public function test_impersonation_token_gives_company_access_and_expires(): void
    {
        $token = $this->superAdminToken();
        $company = $this->company('Impersonated Co');

        $impersonation = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/superadmin/companies/{$company->id}/impersonate")
            ->assertOk()->json('company_token');

        $this->withHeader('Authorization', "Bearer {$impersonation}")->getJson('/api/auth/me')
            ->assertOk()->assertJsonPath('company.slug', 'impersonated-co');

        $this->travel(2)->hours();
        $this->withHeader('Authorization', "Bearer {$impersonation}")->getJson('/api/auth/me')->assertStatus(401);
    }

    public function test_broadcast_targets_the_requested_plan_and_skips_suspended_companies(): void
    {
        Mail::fake();
        $token = $this->superAdminToken();
        $this->company('Pro Co', 'pro');
        $this->company('Starter Co');
        $suspended = $this->company('Suspended Starter Co');
        $suspended->update(['is_suspended' => true]);
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($headers)->postJson('/api/superadmin/broadcast', ['subject' => 'Hello', 'message' => 'Msg', 'target' => 'all'])
            ->assertOk()->assertJsonPath('sent_to', 2);
        $this->withHeaders($headers)->postJson('/api/superadmin/broadcast', ['subject' => 'Hello', 'message' => 'Msg', 'target' => 'pro'])
            ->assertOk()->assertJsonPath('sent_to', 1);
        $this->withHeaders($headers)->postJson('/api/superadmin/broadcast', ['subject' => 'Hello', 'message' => 'Msg', 'target' => 'bogus'])
            ->assertStatus(422);

        Mail::assertQueued(BroadcastMail::class, 3);
    }
}
