<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/applications', [ApplicationController::class, 'store']);
Route::post('/applications/{slug}', [ApplicationController::class, 'store']);
Route::get('/company/{slug}', [CompanyController::class, 'show']);

Route::middleware('company.auth')->group(function (): void {
	Route::post('/auth/logout', [AuthController::class, 'logout']);
	Route::get('/auth/me', [AuthController::class, 'me']);
	Route::get('/applications', [ApplicationController::class, 'index']);
	Route::patch('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);
});
