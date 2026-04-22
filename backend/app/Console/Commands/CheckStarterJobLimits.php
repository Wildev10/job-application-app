<?php

namespace App\Console\Commands;

use App\Models\Company;
use App\Services\PlanService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckStarterJobLimits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'starter:check-job-limits';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifie et désactive les postes en excès pour les comptes Starter';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $companies = Company::query()
            ->where('plan', 'starter')
            ->get();

        $verifiedCompaniesCount = $companies->count();
        $deactivatedJobsCount = 0;

        foreach ($companies as $company) {
            $openJobsBefore = $company->jobs()->where('status', 'open')->count();

            PlanService::checkAndDeactivateJobs($company);

            $openJobsAfter = $company->jobs()->where('status', 'open')->count();
            $deactivatedJobsCount += max(0, $openJobsBefore - $openJobsAfter);
        }

        Log::info('Vérification quotidienne des limites de postes Starter terminée.', [
            'verified_companies_count' => $verifiedCompaniesCount,
            'deactivated_jobs_count' => $deactivatedJobsCount,
        ]);

        $this->info(sprintf(
            'Vérification terminée: %d companies vérifiées, %d postes désactivés.',
            $verifiedCompaniesCount,
            $deactivatedJobsCount
        ));

        return self::SUCCESS;
    }
}
