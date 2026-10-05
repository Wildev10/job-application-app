<?php

namespace App\Mail;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public readonly Company $company, public readonly string $verificationUrl)
    {
    }

    /**
     * Build the email verification message.
     */
    public function build(): self
    {
        return $this
            ->subject('Confirmez votre adresse email')
            ->view('emails.verify_email')
            ->with([
                'company' => $this->company,
                'verificationUrl' => $this->verificationUrl,
            ]);
    }
}
