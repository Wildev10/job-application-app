<?php

namespace Tests\Feature;

use App\Mail\PaymentConfirmationMail;
use App\Mail\PaymentFailedMail;
use App\Models\Company;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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

    /**
     * Sign a payload the way FedaPay does: "t=<timestamp>,s=HMAC(<timestamp>.<body>)".
     */
    private function signWebhook(string $rawPayload, string $secret, ?int $timestamp = null): string
    {
        $timestamp ??= time();

        return 't='.$timestamp.',s='.hash_hmac('sha256', $timestamp.'.'.$rawPayload, $secret);
    }

    /**
     * Post a signed FedaPay webhook and return the response.
     */
    private function postWebhook(array $payload, ?string $signature = null): \Illuminate\Testing\TestResponse
    {
        $rawPayload = json_encode($payload, JSON_THROW_ON_ERROR);

        return $this->call('POST', '/api/payments/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X-FEDAPAY-SIGNATURE' => $signature ?? $this->signWebhook($rawPayload, 'whsec_test_secret'),
        ], $rawPayload);
    }

    private function pendingPayment(Company $company, string $transactionId): Payment
    {
        return Payment::create([
            'company_id' => $company->id,
            'fedapay_transaction_id' => $transactionId,
            'amount' => 15000,
            'currency' => 'XOF',
            'status' => 'pending',
            'plan' => 'pro',
        ]);
    }

    public function test_webhook_reads_the_real_fedapay_entity_payload(): void
    {
        Mail::fake();
        config(['fedapay.webhook_secret' => 'whsec_test_secret']);
        $auth = $this->createAuthenticatedCompany();
        $payment = $this->pendingPayment($auth['company'], '518200');

        // Structure observed on real FedaPay sandbox webhooks (transaction under "entity").
        $this->postWebhook([
            'name' => 'transaction.approved',
            'object' => 'event',
            'entity' => [
                'klass' => 'v1/transaction',
                'id' => 518200,
                'status' => 'approved',
                'mode' => 'momo_test',
                'customer_id' => 12345,
                'amount' => 15000,
            ],
        ])->assertOk();

        $payment->refresh();
        $this->assertSame('approved', $payment->status);
        $this->assertSame('momo_test', $payment->payment_method);
        $this->assertSame('pro', $auth['company']->fresh()->plan);
        Mail::assertSent(PaymentConfirmationMail::class, 1);
    }

    public function test_webhook_rejects_old_plain_hmac_signature_and_stale_timestamp(): void
    {
        config(['fedapay.webhook_secret' => 'whsec_test_secret']);
        $auth = $this->createAuthenticatedCompany();
        $payment = $this->pendingPayment($auth['company'], 'txn_sig');
        $payload = ['name' => 'transaction.approved', 'data' => ['object' => ['id' => 'txn_sig']]];
        $raw = json_encode($payload, JSON_THROW_ON_ERROR);

        $this->postWebhook($payload, hash_hmac('sha256', $raw, 'whsec_test_secret'))->assertStatus(401);
        $this->postWebhook($payload, $this->signWebhook($raw, 'whsec_test_secret', time() - 3600))->assertStatus(401);
        $this->postWebhook($payload, $this->signWebhook($raw, 'autre-secret'))->assertStatus(401);

        $this->assertSame('pending', $payment->fresh()->status);
    }

    public function test_webhook_is_rejected_when_secret_is_not_configured(): void
    {
        config(['fedapay.webhook_secret' => '']);
        $payload = ['name' => 'transaction.approved', 'data' => ['object' => ['id' => 'txn_x']]];
        $raw = json_encode($payload, JSON_THROW_ON_ERROR);

        $this->postWebhook($payload, $this->signWebhook($raw, ''))->assertStatus(401);
    }

    public function test_replayed_approved_webhook_does_not_extend_the_plan_or_resend_email(): void
    {
        Mail::fake();
        config(['fedapay.webhook_secret' => 'whsec_test_secret']);
        $auth = $this->createAuthenticatedCompany();
        $payment = $this->pendingPayment($auth['company'], 'txn_replay');
        $payload = ['name' => 'transaction.approved', 'data' => ['object' => ['id' => 'txn_replay', 'mode' => 'moov']]];

        $this->postWebhook($payload)->assertOk();
        $firstEnd = $payment->fresh()->period_end;
        $this->travel(5)->days();
        $this->postWebhook($payload)->assertOk();

        $this->assertEquals($firstEnd, $payment->fresh()->period_end);
        Mail::assertSent(PaymentConfirmationMail::class, 1);
    }

    public function test_late_cancel_webhook_does_not_undo_an_approved_payment(): void
    {
        Mail::fake();
        config(['fedapay.webhook_secret' => 'whsec_test_secret']);
        $auth = $this->createAuthenticatedCompany();
        $payment = $this->pendingPayment($auth['company'], 'txn_late');

        $this->postWebhook(['name' => 'transaction.approved', 'data' => ['object' => ['id' => 'txn_late']]])->assertOk();
        $this->postWebhook(['name' => 'transaction.canceled', 'data' => ['object' => ['id' => 'txn_late']]])->assertOk();

        $this->assertSame('approved', $payment->fresh()->status);
        Mail::assertNotSent(PaymentFailedMail::class);
    }

    public function test_declined_webhook_marks_payment_and_notifies_company(): void
    {
        Mail::fake();
        config(['fedapay.webhook_secret' => 'whsec_test_secret']);
        $auth = $this->createAuthenticatedCompany();
        $payment = $this->pendingPayment($auth['company'], 'txn_declined');

        $this->postWebhook(['name' => 'transaction.declined', 'data' => ['object' => ['id' => 'txn_declined']]])->assertOk();

        $this->assertSame('declined', $payment->fresh()->status);
        $this->assertSame('starter', $auth['company']->fresh()->plan);
        Mail::assertSent(PaymentFailedMail::class, 1);
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
            'amount' => 15000,
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
            ->withHeader('X-FEDAPAY-SIGNATURE', 't='.time().',s=invalid-signature')
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
            'amount' => 15000,
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
        $signature = $this->signWebhook($rawPayload, 'whsec_test_secret');

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
