<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Payment;
use App\Services\FedaPayService;
use App\Services\PlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use FedaPay\Webhook;
use FedaPay\WebhookSignature;
use Throwable;

class PaymentController extends Controller
{
    /**
     * Start a new payment intent for the authenticated company.
     */
    public function initiate(Request $request, FedaPayService $fedaPayService): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        if (PlanService::isPro($company)) {
            return response()->json([
                'message' => 'Vous êtes déjà sur le plan Pro.',
            ], 400)->header('Content-Type', 'application/json');
        }

        $recentPendingPaymentExists = Payment::query()
            ->where('company_id', $company->id)
            ->pending()
            ->where('created_at', '>=', now()->subMinutes(30))
            ->exists();

        if ($recentPendingPaymentExists) {
            return response()->json([
                'message' => 'Un paiement est déjà en cours. Réessayez dans quelques minutes.',
            ], 409)->header('Content-Type', 'application/json');
        }

        try {
            $transaction = $fedaPayService->createTransaction($company);

            return response()->json([
                'payment_url' => $transaction['payment_url'],
                'transaction_id' => $transaction['transaction_id'],
                'payment_id' => $transaction['payment_id'],
                'message' => 'Redirection vers le paiement sécurisé',
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable $exception) {
            Log::error('Erreur lors de l\'initiation du paiement FedaPay.', [
                'company_id' => $company->id,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Impossible d\'initialiser le paiement sécurisé pour le moment.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Receive FedaPay webhooks and update local payment state.
     */
    public function webhook(Request $request, FedaPayService $fedaPayService): JsonResponse
    {
        // FedaPay signs "<timestamp>.<body>" and sends "t=<timestamp>,s=<signature>".
        $secret = (string) config('fedapay.webhook_secret');

        try {
            if ($secret === '') {
                throw new \RuntimeException('FEDAPAY_WEBHOOK_SECRET is not configured.');
            }

            WebhookSignature::verifyHeader(
                $request->getContent(),
                (string) $request->header('X-FEDAPAY-SIGNATURE', ''),
                $secret,
                Webhook::DEFAULT_TOLERANCE
            );
        } catch (Throwable $exception) {
            Log::warning('Webhook FedaPay refusé: signature invalide.', [
                'reason' => $exception->getMessage(),
                'has_header' => $request->hasHeader('X-FEDAPAY-SIGNATURE'),
            ]);

            return response()->json([
                'message' => 'Signature invalide.',
            ], 401)->header('Content-Type', 'application/json');
        }

        try {
            $fedaPayService->handleWebhook($request->all());
        } catch (Throwable $exception) {
            Log::error('Erreur lors du traitement du webhook FedaPay.', [
                'message' => $exception->getMessage(),
            ]);

            // A non-2xx answer makes FedaPay retry instead of losing the payment.
            return response()->json([
                'message' => 'Erreur de traitement.',
            ], 500)->header('Content-Type', 'application/json');
        }

        return response()->json([
            'received' => true,
        ], 200)->header('Content-Type', 'application/json');
    }

    /**
     * Renew an existing Pro plan (allowed even while still active).
     */
    public function renew(Request $request, FedaPayService $fedaPayService): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json(['message' => 'Non authentifié'], 401)
                ->header('Content-Type', 'application/json');
        }

        $recentPendingExists = Payment::query()
            ->where('company_id', $company->id)
            ->pending()
            ->where('created_at', '>=', now()->subMinutes(30))
            ->exists();

        if ($recentPendingExists) {
            return response()->json([
                'message' => 'Un paiement est déjà en cours. Réessayez dans quelques minutes.',
            ], 409)->header('Content-Type', 'application/json');
        }

        try {
            $transaction = $fedaPayService->createTransaction($company);

            return response()->json([
                'payment_url' => $transaction['payment_url'],
                'transaction_id' => $transaction['transaction_id'],
                'payment_id' => $transaction['payment_id'],
                'message' => 'Renouvellement initié',
            ], 200)->header('Content-Type', 'application/json');
        } catch (Throwable $exception) {
            Log::error('Erreur lors du renouvellement FedaPay.', [
                'company_id' => $company->id,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'Impossible d\'initialiser le renouvellement pour le moment.',
            ], 500)->header('Content-Type', 'application/json');
        }
    }

    /**
     * Return the latest payment history for the authenticated company.
     */
    public function history(Request $request): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        $payments = Payment::query()
            ->where('company_id', $company->id)
            ->latest()
            ->limit(12)
            ->get();

        $history = $payments->map(static function (Payment $payment): array {
            return [
                'id' => $payment->id,
                'amount_formatted' => $payment->amount_formatted,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'period_start' => $payment->period_start,
                'period_end' => $payment->period_end,
                'paid_at' => $payment->paid_at,
                'created_at' => $payment->created_at,
            ];
        });

        return response()->json($history, 200)->header('Content-Type', 'application/json');
    }

    /**
     * Return the status of a specific payment owned by the authenticated company.
     */
    public function status(Request $request, int $paymentId, FedaPayService $fedaPayService): JsonResponse
    {
        /** @var Company|null $company */
        $company = $request->attributes->get('company');

        if ($company === null) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401)->header('Content-Type', 'application/json');
        }

        $payment = Payment::query()
            ->where('id', $paymentId)
            ->where('company_id', $company->id)
            ->first();

        if ($payment === null) {
            return response()->json([
                'message' => 'Paiement introuvable.',
            ], 404)->header('Content-Type', 'application/json');
        }

        // If still pending and not a mock, query FedaPay directly so the status
        // resolves even when the webhook never arrives (localhost dev, ngrok absent).
        if ($payment->status === 'pending' && ! str_starts_with($payment->fedapay_transaction_id, 'mock_')) {
            try {
                \FedaPay\FedaPay::setApiKey((string) config('fedapay.secret_key'));
                \FedaPay\FedaPay::setEnvironment((string) config('fedapay.environment'));
                $transaction = \FedaPay\Transaction::retrieve((int) $payment->fedapay_transaction_id);
                $remoteStatus = strtolower((string) ($transaction->status ?? ''));

                if ($remoteStatus === 'approved') {
                    $fedaPayService->handleApprovedPaymentPublic($payment, $transaction->__toArray(true));
                    $payment->refresh();
                } elseif (in_array($remoteStatus, ['canceled', 'declined', 'refunded'], true)) {
                    $payment->update(['status' => $remoteStatus]);
                    $payment->refresh();
                }
            } catch (Throwable $exception) {
                Log::warning('FedaPay status poll failed.', [
                    'payment_id' => $payment->id,
                    'message' => $exception->getMessage(),
                ]);
            }
        }

        return response()->json([
            'id' => $payment->id,
            'status' => $payment->status,
            'amount_formatted' => $payment->amount_formatted,
            'payment_method' => $payment->payment_method,
            'transaction_id' => $payment->fedapay_transaction_id,
            'paid_at' => $payment->paid_at,
            'period_start' => $payment->period_start,
            'period_end' => $payment->period_end,
        ], 200)->header('Content-Type', 'application/json');
    }
}
