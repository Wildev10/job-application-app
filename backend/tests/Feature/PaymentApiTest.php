<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Create a company account and return the model with its bearer token.
     *
     * @return array{company: Company, token: string}
     */
    private function createAuthenticatedCompany(
        string $name = 'Paying Co',
        string $email = 'paying@example.com',
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

    public function test_initiate_returns_400_when_company_is_already_pro(): void
    {
        $auth = $this->createAuthenticatedCompany(
            name: 'Already Pro',
            email: 'already-pro@example.com',
            plan: 'pro',
            planExpiresAt: now()->addDays(10)
        );

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->postJson('/api/payments/initiate');

        $response->assertStatus(400)
            ->assertJsonPath('message', 'Vous êtes déjà sur le plan Pro.');
    }

    public function test_initiate_returns_409_when_recent_pending_payment_exists(): void
    {
        $auth = $this->createAuthenticatedCompany();

        Payment::create([
            'company_id' => $auth['company']->id,
            'fedapay_transaction_id' => 'txn-pending-1',
            'amount' => 1500000,
            'currency' => 'XOF',
            'status' => 'pending',
            'plan' => 'pro',
        ]);

        $response = $this
            ->withHeader('Authorization', "Bearer {$auth['token']}")
            ->postJson('/api/payments/initiate');

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Un paiement est déjà en cours. Réessayez dans quelques minutes.');
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        config(['fedapay.webhook_secret' => 'whsec_test_secret']);

        $response = $this
            ->withHeader('X-FEDAPAY-SIGNATURE', 'invalid-signature')
            ->postJson('/api/payments/webhook', [
                'name' => 'transaction.approved',
                'data' => [
                    'object' => [
                        'id' => 'txn_123',
                    ],
                ],
            ]);

        $response->assertStatus(401);
    }

    public function test_webhook_approved_updates_payment_and_company_plan(): void
    {
        config(['fedapay.webhook_secret' => 'whsec_test_secret']);

        $auth = $this->createAuthenticatedCompany();

        $payment = Payment::create([
            'company_id' => $auth['company']->id,
            'fedapay_transaction_id' => 'txn_approved_1',
            'amount' => 1500000,
            'currency' => 'XOF',
            'status' => 'pending',
            'plan' => 'pro',
        ]);

        $payload = [
            'name' => 'transaction.approved',
            'data' => [
                'object' => [
                    'id' => 'txn_approved_1',
                    'mode' => 'mtn_open_api',
                    'customer' => [
                        'id' => 'cust_001',
                    ],
                ],
            ],
        ];

        $rawPayload = json_encode($payload, JSON_THROW_ON_ERROR);
        $signature = hash_hmac('sha256', $rawPayload, 'whsec_test_secret');

        $response = $this->call(
            'POST',
            '/api/payments/webhook',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X-FEDAPAY-SIGNATURE' => $signature,
            ],
            $rawPayload
        );

        $response->assertStatus(200)
            ->assertJsonPath('received', true);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'approved',
            'payment_method' => 'mtn_open_api',
            'fedapay_customer_id' => 'cust_001',
        ]);

        $this->assertDatabaseHas('companies', [
            'id' => $auth['company']->id,
            'plan' => 'pro',
        ]);
    }
}
