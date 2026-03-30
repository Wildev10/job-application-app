<?php

namespace Tests\Unit;

use App\Services\ScoringService;
use PHPUnit\Framework\TestCase;

class ScoringServiceTest extends TestCase
{
    public function test_it_returns_zero_with_empty_data(): void
    {
        $service = new ScoringService;

        $this->assertSame(0, $service->calculate([]));
    }

    public function test_it_counts_all_criteria_up_to_five(): void
    {
        $service = new ScoringService;

        $score = $service->calculate([
            'email' => 'candidate@example.com',
            'portfolio' => 'https://portfolio.example.com',
            'motivation' => 'Je suis passionne par le produit et l innovation.',
            'cv' => 'cvs/candidate.pdf',
            'role' => 'dev',
        ]);

        $this->assertSame(5, $score);
    }

    public function test_it_detects_keywords_with_accents_and_case_insensitivity(): void
    {
        $service = new ScoringService;

        $score = $service->calculate([
            'email' => 'candidate@example.com',
            'motivation' => 'Je suis tres PASSIONNE et motive.',
            'role' => 'designer',
        ]);

        $this->assertSame(3, $score);
    }
}
