<?php

namespace App\Mail;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PlanExpiringMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly Company $company,
        public readonly int $daysLeft,
    ) {
    }

    public function build(): self
    {
        return $this
            ->subject("Votre plan Pro expire dans {$this->daysLeft} jour" . ($this->daysLeft > 1 ? 's' : '') . ' — Renouvelez maintenant')
            ->view('emails.plan_expiring')
            ->with([
                'company' => $this->company,
                'daysLeft' => $this->daysLeft,
                'renewUrl' => rtrim((string) config('app.frontend_url'), '/') . '/admin/upgrade?renew=1',
            ]);
    }
}
