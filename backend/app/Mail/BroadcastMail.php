<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BroadcastMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly string $emailSubject,
        public readonly string $emailMessage,
        public readonly string $companyName,
    ) {
    }

    /**
     * Build the broadcast email.
     */
    public function build(): self
    {
        return $this
            ->subject($this->emailSubject)
            ->view('emails.broadcast')
            ->with([
                'subjectLine' => $this->emailSubject,
                'messageBody' => $this->emailMessage,
                'companyName' => $this->companyName,
            ]);
    }
}
