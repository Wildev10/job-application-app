<?php

namespace Tests\Feature;

use App\Mail\CandidatureReceivedAdmin;
use App\Mail\CandidatureReceivedApplicant;
use App\Mail\StatusUpdated;
use App\Models\Application;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Group;
use Tests\TestCase;

#[Group('mail')]
class ApplicationMailTemplateRenderingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Create a company fixture used by mailable rendering tests.
     */
    private function createCompany(): Company
    {
        return Company::create([
            'name' => 'Vaybe',
            'email' => 'rh@vaybe.tech',
            'password' => Hash::make('password123'),
            'slug' => 'vaybe',
            'color' => '#0f766e',
        ]);
    }

    public function test_applicant_confirmation_mail_has_professional_subject_and_content(): void
    {
        config(['app.frontend_url' => 'https://jobs.vaybe.tech']);

        $company = $this->createCompany();
        $application = Application::factory()->create([
            'company_id' => $company->id,
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'role' => 'dev',
            'score' => 4,
        ]);

        $mail = new CandidatureReceivedApplicant($application, $company);
        $mail->build();
        $html = $mail->render();
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8');

        $this->assertSame('Votre candidature a bien été reçue — Vaybe', $mail->subject);
        $this->assertStringContainsString('Bonjour Jean Dupont', $text);
        $this->assertStringContainsString('Nous avons bien reçu votre candidature', $text);
        $this->assertStringContainsString("L'équipe Vaybe", $text);
        $this->assertStringContainsString('https://jobs.vaybe.tech', $html);
    }

    public function test_admin_notification_mail_has_candidate_details_and_admin_link(): void
    {
        config(['app.frontend_url' => 'https://jobs.vaybe.tech']);

        $company = $this->createCompany();
        $application = Application::factory()->create([
            'company_id' => $company->id,
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'role' => 'designer',
            'score' => 5,
            'motivation' => 'Je souhaite rejoindre votre équipe créative.',
        ]);

        $mail = new CandidatureReceivedAdmin($application, $company);
        $mail->build();
        $html = $mail->render();
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8');

        $this->assertSame('🔔 Nouvelle candidature reçue — Jean Dupont (designer)', $mail->subject);
        $this->assertStringContainsString('Nouvelle candidature reçue', $text);
        $this->assertStringContainsString('jean@example.com', $text);
        $this->assertStringContainsString('/admin/candidatures', $html);
        $this->assertStringContainsString("L'équipe Vaybe", $text);
    }

    public function test_status_update_mail_has_status_badge_and_custom_message(): void
    {
        config(['app.frontend_url' => 'https://jobs.vaybe.tech']);

        $company = $this->createCompany();
        $application = Application::factory()->create([
            'company_id' => $company->id,
            'nom' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'status' => 'reviewing',
        ]);

        $mail = new StatusUpdated($application, $company);
        $mail->build();
        $html = $mail->render();
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8');

        $this->assertSame('Mise à jour de votre candidature — Vaybe', $mail->subject);
        $this->assertStringContainsString('Bonjour Jean Dupont', $text);
        $this->assertStringContainsString("En cours d'examen", $text);
        $this->assertStringContainsString("en cours d'examen", strtolower($text));
        $this->assertStringContainsString('https://jobs.vaybe.tech', $html);
    }
}
