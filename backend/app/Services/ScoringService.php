<?php

namespace App\Services;

use Illuminate\Support\Str;

class ScoringService
{
    private const DETAILED_MOTIVATION_LENGTH = 200;

    /**
     * Compute the candidate score based on provided application data.
     */
    public function calculate(array $data): int
    {
        $score = 0;

        // Portfolio or a detailed motivation: not every job has a portfolio.
        if (! empty($data['portfolio']) || mb_strlen(trim((string) ($data['motivation'] ?? ''))) >= self::DETAILED_MOTIVATION_LENGTH) {
            $score++;
        }

        if (filter_var($data['email'] ?? null, FILTER_VALIDATE_EMAIL)) {
            $score++;
        }

        if ($this->containsMotivationKeyword((string) ($data['motivation'] ?? ''))) {
            $score++;
        }

        if (! empty($data['cv'])) {
            $score++;
        }

        if (! empty($data['role'])) {
            $score++;
        }

        return min($score, 5);
    }

    /**
     * Check if motivation text contains at least one expected keyword.
     */
    private function containsMotivationKeyword(string $motivation): bool
    {
        $keywords = [
            'passionne',
            'passion',
            'motive',
            'motivation',
            'experience',
            'creatif',
            'creativite',
            'innovant',
            'innovation',
            'equipe',
            'team',
            'challenge',
            'resoudre',
            'apprendre',
            'evoluer',
        ];

        $normalized = Str::lower(Str::ascii($motivation));

        foreach ($keywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return true;
            }
        }

        return false;
    }
}
