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
        $email = (string) env('SUPER_ADMIN_EMAIL', '');
        $password = (string) env('SUPER_ADMIN_PASSWORD', '');

        if ($email === '' || $password === '') {
            $this->command?->warn('SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD manquants : super admin non créé.');

            return;
        }

        if (SuperAdmin::where('email', $email)->exists()) {
            return;
        }

        SuperAdmin::create([
            'name' => (string) env('SUPER_ADMIN_NAME', 'Super Admin'),
            'email' => $email,
            'password' => bcrypt($password),
        ]);
    }
}
