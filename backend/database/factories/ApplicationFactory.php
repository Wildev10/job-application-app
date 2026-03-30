<?php

namespace Database\Factories;

use App\Models\Application;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $role = fake()->randomElement(['dev', 'designer']);

        return [
            'nom' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'role' => $role,
            'motivation' => 'Je suis passionne et motive pour evoluer dans votre equipe.',
            'portfolio' => fake()->optional()->url(),
            'cv' => fake()->optional()->filePath(),
            'score' => fake()->numberBetween(0, 5),
        ];
    }
}
