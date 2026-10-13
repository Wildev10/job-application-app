<?php

namespace App\Services;

use Illuminate\Support\Str;

class ScoringService
{
    /**
     * Compute the candidate score out of 10 based on provided application data.
     *
     * Breakdown:
     *  +1  valid email
     *  +1  role specified
     *  +2  CV attached
     *  +2  portfolio URL provided
     *  +1  motivation ≥ 50 chars
     *  +1  motivation ≥ 150 chars
     *  +1  motivation ≥ 300 chars
     *  +1  motivation contains at least one quality keyword
     */
    public function calculate(array $data): int
    {
        $score = 0;

        if (filter_var($data['email'] ?? null, FILTER_VALIDATE_EMAIL)) {
            $score++;
        }

        if (! empty($data['role'])) {
            $score++;
        }

        if (! empty($data['cv'])) {
            $score += 2;
        }

        if (! empty($data['portfolio'])) {
            $score += 2;
        }

        $motivationLength = mb_strlen(trim((string) ($data['motivation'] ?? '')));

        if ($motivationLength >= 50) {
            $score++;
        }

        if ($motivationLength >= 150) {
            $score++;
        }

        if ($motivationLength >= 300) {
            $score++;
        }

        if ($this->containsQualityKeyword((string) ($data['motivation'] ?? ''))) {
            $score++;
        }

        return min($score, 10);
    }

    /**
     * Check if motivation text contains at least one quality keyword.
     */
    private function containsQualityKeyword(string $motivation): bool
    {
        $keywords = [
            'passionne', 'passion', 'motive', 'motivation',
            'experience', 'competence', 'expertise',
            'creatif', 'creativite', 'innovant', 'innovation',
            'equipe', 'team', 'collabor',
            'challenge', 'objectif', 'resoudre', 'solution',
            'apprendre', 'evoluer', 'progresser', 'developper',
            'resultats', 'performance', 'impact',
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
