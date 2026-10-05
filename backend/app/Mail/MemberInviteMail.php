<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\CompanyMember;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MemberInviteMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly CompanyMember $member,
        public readonly Company $company,
        public readonly string $acceptUrl,
    ) {}

    public function build(): self
    {
        return $this
            ->subject("Invitation à rejoindre {$this->company->name} sur Vaybe")
            ->view('emails.member_invite')
            ->with([
                'member'    => $this->member,
                'company'   => $this->company,
                'acceptUrl' => $this->acceptUrl,
            ]);
    }
}
