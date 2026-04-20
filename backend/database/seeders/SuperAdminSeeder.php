<?php

namespace Database\Seeders;

use App\Models\SuperAdmin;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed the super admin account from environment variables.
     */
    public function run(): void
    {
        $email = (string) env('SUPER_ADMIN_EMAIL', 'wilfried.deguenon@epitech.eu');

        if (SuperAdmin::where('email', $email)->exists()) {
            return;
        }

        SuperAdmin::create([
            'name' => (string) env('SUPER_ADMIN_NAME', 'Super Admin'),
            'email' => $email,
            'password' => bcrypt((string) env('SUPER_ADMIN_PASSWORD', 'Trellix@12')),
        ]);
    }
}
