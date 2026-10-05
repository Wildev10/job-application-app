<?php

namespace Tests\Unit;

use App\Models\Company;
use App\Models\Job;
use App\Services\PlanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PlanServiceTest extends TestCase
{
    use RefreshDatabase;

    private function createStarterCompany(string $name = 'Starter QA', string $email = 'starter.qa@example.com'): Company
    {
        return Company::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('password123'),
            'slug' => Company::generateSlug($name),
            'plan' => 'starter',
            'plan_expires_at' => null,
        ]);
    }

    public function test_check_and_deactivate_jobs_closes_oldest_excess_open_jobs_for_starter(): void
    {
        $company = $this->createStarterCompany();

        $oldest = Job::create([
            'company_id' => $company->id,
            'title' => 'Oldest',
            'slug' => 'oldest',
            'description' => 'desc',
            'role' => 'dev',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        Job::create([
            'company_id' => $company->id,
            'title' => 'Middle',
            'slug' => 'middle',
            'description' => 'desc',
            'role' => 'dev',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        $newest = Job::create([
            'company_id' => $company->id,
            'title' => 'Newest',
            'slug' => 'newest',
            'description' => 'desc',
            'role' => 'dev',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        Job::query()->whereKey($oldest->id)->update([
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        Job::query()->where('company_id', $company->id)->where('slug', 'middle')->update([
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        Job::query()->whereKey($newest->id)->update([
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        PlanService::checkAndDeactivateJobs($company);

        $this->assertDatabaseHas('jobs', [
            'id' => $oldest->id,
            'status' => 'closed',
        ]);

        $this->assertDatabaseHas('jobs', [
            'id' => $newest->id,
            'status' => 'open',
        ]);

        $this->assertSame(
            PlanService::STARTER_MAX_JOBS,
            Job::query()->where('company_id', $company->id)->where('status', 'open')->count()
        );
    }

    public function test_check_and_deactivate_jobs_does_nothing_for_pro(): void
    {
        $company = Company::create([
            'name' => 'Pro QA',
            'email' => 'pro.qa@example.com',
            'password' => Hash::make('password123'),
            'slug' => 'pro-qa',
            'plan' => 'pro',
            'plan_expires_at' => now()->addMonth(),
        ]);

        Job::create([
            'company_id' => $company->id,
            'title' => 'Job 1',
            'slug' => 'pro-job-1',
            'description' => 'desc',
            'role' => 'dev',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        Job::create([
            'company_id' => $company->id,
            'title' => 'Job 2',
            'slug' => 'pro-job-2',
            'description' => 'desc',
            'role' => 'dev',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        Job::create([
            'company_id' => $company->id,
            'title' => 'Job 3',
            'slug' => 'pro-job-3',
            'description' => 'desc',
            'role' => 'dev',
            'type' => 'full_time',
            'status' => 'open',
        ]);

        PlanService::checkAndDeactivateJobs($company);

        $this->assertSame(
            3,
            Job::query()->where('company_id', $company->id)->where('status', 'open')->count()
        );
    }
}
