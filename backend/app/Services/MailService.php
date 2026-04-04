<?php

namespace App\Services;

use App\Mail\CandidatureReceivedAdmin;
use App\Mail\CandidatureReceivedApplicant;
use App\Mail\StatusUpdated;
use App\Models\Application;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
}
