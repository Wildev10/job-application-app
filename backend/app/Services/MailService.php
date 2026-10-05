<?php

namespace App\Services;

use App\Mail\CandidatureReceivedAdmin;
use App\Mail\CandidatureReceivedApplicant;
use App\Mail\PaymentConfirmationMail;
use App\Mail\PaymentFailedMail;
use App\Mail\PlanExpiredMail;
use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use App\Mail\StatusUpdated;
use App\Models\Application;
use App\Models\Company;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Throwable;

class MailService
{
    /**
     * Send confirmation emails to both applicant and company admin.
     */
    public static function sendCandidatureReceived(Application $application): void
    {
        try {
            if (! $application->relationLoaded('company')) {
                $application->load('company');
            }

            $company = $application->company;
            if ($company === null) {
                Log::error('Unable to send candidature received emails: company missing.', [
                    'application_id' => $application->id,
                ]);

                return;
            }

            Mail::to($application->email)->send(new CandidatureReceivedApplicant($application, $company));
            // Mailtrap free plan rate-limit: 1 email/2s — space out the two sends.
            if (app()->environment('local', 'testing')) {
                usleep(500000);
            }
            Mail::to($company->email)->send(new CandidatureReceivedAdmin($application, $company));
        } catch (Throwable $exception) {
            Log::error('Failed to send candidature received emails.', [
                'application_id' => $application->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Send a status update email to the applicant when status is not pending.
     */
    public static function sendStatusUpdated(Application $application): void
    {
        if ($application->status === 'pending') {
            return;
        }

        try {
            if (! $application->relationLoaded('company')) {
                $application->load('company');
            }

            $company = $application->company;
            if ($company === null) {
                Log::error('Unable to send status update email: company missing.', [
                    'application_id' => $application->id,
                    'status' => $application->status,
                ]);

                return;
            }

            Mail::to($application->email)->send(new StatusUpdated($application, $company));
        } catch (Throwable $exception) {
            Log::error('Failed to send status update email.', [
                'application_id' => $application->id,
                'status' => $application->status,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Send payment confirmation email after a successful Pro upgrade.
     */
    public static function sendPaymentConfirmation(Payment $payment): void
    {
        try {
            if (! $payment->relationLoaded('company')) {
                $payment->load('company');
            }

            $company = $payment->company;
            if ($company === null) {
                Log::error('Unable to send payment confirmation email: company missing.', [
                    'payment_id' => $payment->id,
                ]);

                return;
            }

            Mail::to($company->email)->send(new PaymentConfirmationMail($payment));
        } catch (Throwable $exception) {
            Log::error('Failed to send payment confirmation email.', [
                'payment_id' => $payment->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Send plan expiration notification email to the company.
     */
    public static function sendPlanExpired(Company $company): void
    {
        try {
            Mail::to($company->email)->send(new PlanExpiredMail($company));
        } catch (Throwable $exception) {
            Log::error('Failed to send plan expired email.', [
                'company_id' => $company->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Send the email verification link to a newly registered company.
     */
    public static function sendEmailVerification(Company $company): void
    {
        try {
            $url = URL::temporarySignedRoute('verification.verify', now()->addDay(), [
                'id' => $company->id,
                'hash' => sha1($company->email),
            ]);

            Mail::to($company->email)->send(new VerifyEmailMail($company, $url));
        } catch (Throwable $exception) {
            Log::error('Failed to send email verification.', [
                'company_id' => $company->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Send the password reset link to a company.
     */
    public static function sendPasswordReset(Company $company, string $token): void
    {
        try {
            $url = rtrim((string) config('app.frontend_url'), '/').'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $company->email,
            ]);

            Mail::to($company->email)->send(new ResetPasswordMail($company, $url));
        } catch (Throwable $exception) {
            Log::error('Failed to send password reset email.', [
                'company_id' => $company->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Send payment failure notification email.
     */
    public static function sendPaymentFailed(Payment $payment): void
    {
        try {
            if (! $payment->relationLoaded('company')) {
                $payment->load('company');
            }

            $company = $payment->company;
            if ($company === null) {
                Log::error('Unable to send payment failure email: company missing.', [
                    'payment_id' => $payment->id,
                ]);

                return;
            }

            Mail::to($company->email)->send(new PaymentFailedMail($payment));
        } catch (Throwable $exception) {
            Log::error('Failed to send payment failure email.', [
                'payment_id' => $payment->id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
