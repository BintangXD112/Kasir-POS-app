<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\KasirController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Models\User;

Route::get('/', function () {
    if (Auth::check()) {
        // Redirect ke halaman sesuai tipe_user
        return redirect()->route(Auth::user()->tipe_user === 'admin' ? 'admin' : 'kasir');
    }

    // Jika belum login, tampilkan halaman login
    return redirect()->route('login');
});

// Halaman login inertia (otomatis disediakan oleh controller Auth bawaan inertia)
Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('login');

// Logout route
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// Route untuk user yang sudah login
Route::middleware(['auth'])->group(function () {
    Route::get('/kasir', [KasirController::class, 'index'])->name('kasir');
    Route::get('/admin', fn () => Inertia::render('Admin'))->name('admin');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
