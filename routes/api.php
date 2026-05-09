<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployeeController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user/profile', [AttendanceController::class, 'profile']);
    Route::post('attendance', [AttendanceController::class, 'store']);
    Route::get('attendance/history', [AttendanceController::class, 'history']);

    // Employee routes (admin only)
    Route::get('employees', [EmployeeController::class, 'index']);
    Route::get('employees/{id}', [EmployeeController::class, 'show']);
});

