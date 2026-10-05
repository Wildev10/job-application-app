<?php

namespace App\Mail;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public readonly Company $company, public readonly string $resetUrl)
    {
    }

    /**
     * Build the password reset message.
     */
    public function build(): self
    {
        return $this
            ->subject('Réinitialisation de votre mot de passe')
            ->view('emails.reset_password')
            ->with([
                'company' => $this->company,
                'resetUrl' => $this->resetUrl,
            ]);
    }
}
