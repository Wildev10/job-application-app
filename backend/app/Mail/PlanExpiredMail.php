<?php

namespace App\Mail;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PlanExpiredMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public readonly Company $company)
    {
    }

    /**
     * Build the plan expiration email.
     */
    public function build(): self
    {
        return $this
            ->subject('Votre plan Pro a expiré')
            ->view('emails.plan_expired')
            ->with([
                'company' => $this->company,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
            ]);
    }
}
