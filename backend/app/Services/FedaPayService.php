<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Payment;
use FedaPay\FedaPay;
use FedaPay\Transaction;
use Illuminate\Support\Facades\Log;
use Throwable;

class FedaPayService
{
    /**
     * Configure FedaPay SDK with environment values.
     */
    public function __construct()
    {
        FedaPay::setApiKey((string) config('fedapay.secret_key'));
        FedaPay::setEnvironment((string) config('fedapay.environment'));
    }

    /**
     * Create a pending FedaPay transaction and local payment record.
     *
     * @return array{payment_url: string, transaction_id: string, payment_id: int, token: string}
     *
     * @throws \RuntimeException
     */
    public function createTransaction(Company $company): array
    {
        if ((bool) config('fedapay.mock_mode')) {
            return $this->createMockTransaction($company);
        }

        try {
            $transaction = Transaction::create([
                'description' => 'Plan Pro - Vaybe Recrutement',
                'amount' => config('fedapay.pro_price'),
                'currency' => ['iso' => 'XOF'],
                'callback_url' => config('fedapay.callback_url'),
                'customer' => [
                    'firstname' => $company->name,
                    'lastname' => '',
                    'email' => $company->email,
                ],
            ]);

            $token = $transaction->generateToken([
                'return_url' => config('fedapay.return_url'),
                'cancel_url' => config('fedapay.cancel_url'),
            ]);

            $payment = Payment::query()->create([
                'company_id' => $company->id,
                'fedapay_transaction_id' => (string) $transaction->id,
                'fedapay_customer_id' => isset($transaction->customer->id) ? (string) $transaction->customer->id : null,
                'amount' => (int) config('fedapay.pro_price'),
                'currency' => 'XOF',
                'status' => 'pending',
                'plan' => 'pro',
                'metadata' => [
                    'reference' => $transaction->reference ?? null,
                ],
            ]);

            return [
                'payment_url' => (string) $token->url,
                'transaction_id' => (string) $transaction->id,
                'payment_id' => $payment->id,
                'token' => (string) $token->token,
            ];
        } catch (Throwable $exception) {
            throw new \RuntimeException('Impossible de créer la transaction FedaPay pour le moment.', 0, $exception);
        }
    }

    /**
     * Create a local mock transaction for sandbox UI testing without external provider calls.
     *
     * @return array{payment_url: string, transaction_id: string, payment_id: int, token: string}
     */
    private function createMockTransaction(Company $company): array
    {
        $transactionId = 'mock_txn_'.$company->id.'_'.now()->timestamp;
        $autoApprove = (bool) config('fedapay.mock_auto_approve', true);

        $payment = Payment::query()->create([
            'company_id' => $company->id,
            'fedapay_transaction_id' => $transactionId,
            'fedapay_customer_id' => 'mock_customer_'.$company->id,
            'amount' => (int) config('fedapay.pro_price'),
            'currency' => 'XOF',
            'status' => 'pending',
            'plan' => 'pro',
            'metadata' => [
                'provider' => 'mock',
                'note' => 'Local sandbox mock mode enabled.',
            ],
        ]);

        if ($autoApprove) {
            $this->handleApprovedPayment($payment, [
                'id' => $transactionId,
                'mode' => 'mtn_open_api',
                'customer' => [
                    'id' => 'mock_customer_'.$company->id,
                ],
                'provider' => 'mock',
            ]);
        }

        $paymentUrl = (string) (config('fedapay.return_url') ?: rtrim((string) config('app.frontend_url'), '/').'/admin/upgrade?payment=success');

        Log::info('FedaPay mock mode: transaction created locally.', [
            'company_id' => $company->id,
            'payment_id' => $payment->id,
            'transaction_id' => $transactionId,
            'auto_approve' => $autoApprove,
        ]);

        return [
            'payment_url' => $paymentUrl,
            'transaction_id' => $transactionId,
            'payment_id' => $payment->id,
            'token' => 'mock_token_'.$payment->id,
        ];
    }

    /**
     * Process incoming FedaPay webhook payload.
     */
    public function handleWebhook(array $payload): void
    {
        $event = $payload['name'] ?? null;
        $transactionData = $payload['data']['object'] ?? null;

        if (! is_array($transactionData) || empty($transactionData['id'])) {
            Log::warning('Webhook FedaPay ignoré: transaction absente.', [
                'event' => $event,
            ]);

            return;
        }

        $payment = Payment::query()
            ->where('fedapay_transaction_id', (string) $transactionData['id'])
            ->first();

        if ($payment === null) {
            Log::warning('Paiement local introuvable pour transaction FedaPay.', [
                'event' => $event,
                'transaction_id' => (string) $transactionData['id'],
            ]);

            return;
        }

        if ($event === 'transaction.approved') {
            $this->handleApprovedPayment($payment, $transactionData);

            return;
        }

        if ($event === 'transaction.canceled') {
            $payment->update(['status' => 'canceled']);
            MailService::sendPaymentFailed($payment);

            return;
        }

        if ($event === 'transaction.declined') {
            $payment->update(['status' => 'declined']);
            MailService::sendPaymentFailed($payment);
        }
    }

    /**
     * Apply approved payment side effects on payment and company plan.
     */
    private function handleApprovedPayment(Payment $payment, array $data): void
    {
        $periodStart = now();
        $periodEnd = now()->addDays(30);

        $payment->update([
            'status' => 'approved',
            'paid_at' => now(),
            'payment_method' => $data['mode'] ?? null,
            'period_start' => $periodStart->toDateString(),
            'period_end' => $periodEnd->toDateString(),
            'fedapay_customer_id' => isset($data['customer']['id']) ? (string) $data['customer']['id'] : $payment->fedapay_customer_id,
            'metadata' => $data,
        ]);

        $company = $payment->company;
        if ($company !== null) {
            $company->update([
                'plan' => 'pro',
                'plan_expires_at' => $periodEnd,
            ]);
        }

        MailService::sendPaymentConfirmation($payment->fresh(['company']));

        Log::info('Paiement FedaPay approuvé et plan Pro activé.', [
            'payment_id' => $payment->id,
            'company_id' => $payment->company_id,
            'transaction_id' => $payment->fedapay_transaction_id,
        ]);
    }

    /**
     * Downgrade expired Pro plans and enforce Starter limits.
     */
    public function checkExpiredPlans(): void
    {
        $expiredCompanies = Company::query()
            ->where('plan', 'pro')
            ->whereNotNull('plan_expires_at')
            ->where('plan_expires_at', '<=', now())
            ->get();

        foreach ($expiredCompanies as $company) {
            $company->update([
                'plan' => 'starter',
                'plan_expires_at' => null,
            ]);

            PlanService::checkAndDeactivateJobs($company);
            MailService::sendPlanExpired($company);

            Log::info('Plan Pro expiré: retour automatique au plan Starter.', [
                'company_id' => $company->id,
            ]);
        }
    }
}
