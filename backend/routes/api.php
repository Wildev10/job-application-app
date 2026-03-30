<?php

use App\Http\Controllers\ApplicationController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:60,1')->group(function (): void {
	Route::get('/applications', [ApplicationController::class, 'index']);
	Route::post('/applications', [ApplicationController::class, 'store']);
});
