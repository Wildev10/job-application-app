<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmationMail extends Mailable
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
     * Build the payment confirmation email.
     */
    public function build(): self
    {
        return $this
            ->subject('Paiement confirmé - Plan Pro activé')
            ->view('emails.payment_confirmation')
            ->with([
                'payment' => $this->payment,
                'company' => $this->payment->company,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
            ]);
    }
}
