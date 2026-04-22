<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\SuperAdmin\AuthController as SuperAdminAuthController;
use App\Http\Controllers\SuperAdmin\BroadcastController as SuperAdminBroadcastController;
use App\Http\Controllers\SuperAdmin\CompaniesController as SuperAdminCompaniesController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/jobs/public/{companySlug}/{jobSlug}', [JobController::class, 'showPublic']);
Route::post('/applications', [ApplicationController::class, 'store']);
Route::post('/applications/{companySlug}/{jobSlug}', [ApplicationController::class, 'store']);
Route::post('/applications/{slug}', [ApplicationController::class, 'store']);

Route::middleware('company.auth')->group(function (): void {
	Route::post('/auth/logout', [AuthController::class, 'logout']);
	Route::get('/auth/me', [AuthController::class, 'me']);
	// Return onboarding progress metrics for the authenticated company.
	Route::get('/company/onboarding-status', [CompanyController::class, 'onboardingStatus']);
	Route::get('/company/plan-status', [CompanyController::class, 'planStatus']);
	Route::patch('/company/profile', [CompanyController::class, 'updateProfile']);
	Route::get('/jobs', [JobController::class, 'index']);
	Route::post('/jobs', [JobController::class, 'store']);
	Route::get('/jobs/{id}', [JobController::class, 'show']);
	Route::patch('/jobs/{id}', [JobController::class, 'update']);
	Route::delete('/jobs/{id}', [JobController::class, 'destroy']);
	Route::get('/applications/stats', [DashboardController::class, 'stats']);
	Route::get('/applications/export', [ApplicationController::class, 'export']);
	Route::get('/applications', [ApplicationController::class, 'index']);
	Route::patch('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);
});

// Keep this route after /company/onboarding-status to avoid slug conflicts.
Route::get('/company/{slug}', [CompanyController::class, 'show']);

// Super admin public routes.
Route::prefix('superadmin')->group(function (): void {
	Route::post('/auth/login', [SuperAdminAuthController::class, 'login']);
});

// Super admin protected routes.
Route::prefix('superadmin')
	->middleware('super.admin.auth')
	->group(function (): void {
		Route::post('/auth/logout', [SuperAdminAuthController::class, 'logout']);
		Route::get('/auth/me', [SuperAdminAuthController::class, 'me']);
		Route::get('/stats', [SuperAdminDashboardController::class, 'stats']);
		Route::get('/companies', [SuperAdminCompaniesController::class, 'index']);
		Route::get('/companies/{id}', [SuperAdminCompaniesController::class, 'show']);
		Route::patch('/companies/{id}/plan', [SuperAdminCompaniesController::class, 'updatePlan']);
		Route::patch('/companies/{id}/suspend', [SuperAdminCompaniesController::class, 'suspend']);
		Route::patch('/companies/{id}/activate', [SuperAdminCompaniesController::class, 'activate']);
		Route::delete('/companies/{id}', [SuperAdminCompaniesController::class, 'destroy']);
		Route::post('/companies/{id}/impersonate', [SuperAdminCompaniesController::class, 'impersonate']);
		Route::post('/broadcast', [SuperAdminBroadcastController::class, 'send']);
	});
