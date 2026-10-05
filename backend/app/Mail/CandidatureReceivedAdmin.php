<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Email sent to the company admin when a new application is submitted.
 */
class CandidatureReceivedAdmin extends Mailable
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
     * Build the admin notification email.
     */
    public function build(): self
    {
        return $this
            ->subject("🔔 Nouvelle candidature reçue — {$this->application->nom} ({$this->application->role})")
            ->view('emails.candidature_received_admin')
            ->with([
                'application' => $this->application,
                'company' => $this->company,
                'adminUrl' => rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/').'/admin/candidatures',
                'frontendUrl' => config('app.frontend_url'),
            ]);
    }
}
