<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Email sent to the candidate when their application status changes.
 */
class StatusUpdated extends Mailable
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
     * Build the status update email.
     */
    public function build(): self
    {
        return $this
            ->subject("Mise à jour de votre candidature — {$this->company->name}")
            ->view('emails.status_updated')
            ->with([
                'application' => $this->application,
                'company' => $this->company,
                'frontendUrl' => config('app.frontend_url'),
            ]);
    }
}
