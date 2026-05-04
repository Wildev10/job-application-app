<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentFailedMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public readonly Payment $payment)
    {
    }

    /**
     * Build the payment failure email.
     */
    public function build(): self
    {
        return $this
            ->subject('Votre paiement n\'a pas abouti')
            ->view('emails.payment_failed')
            ->with([
                'payment' => $this->payment,
                'company' => $this->payment->company,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
            ]);
    }
}
