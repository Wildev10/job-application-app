<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Email sent to a candidate after their application has been received.
 */
class CandidatureReceivedApplicant extends Mailable
{
    use Queueable;
    use SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly Application $application,
        public readonly Company $company,
    ) {
    }

    /**
     * Build the candidate confirmation email.
     */
    public function build(): self
    {
        return $this
            ->subject("Votre candidature a bien été reçue — {$this->company->name}")
            ->view('emails.candidature_received_applicant')
            ->with([
                'application' => $this->application,
                'company' => $this->company,
                'frontendUrl' => config('app.frontend_url'),
            ]);
    }
}
