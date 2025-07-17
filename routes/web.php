<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\KasirController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProdukController;



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
    Route::get('/transaksi', [TransaksiController::class, 'index'])->name('transaksi');
    Route::post('/transaksi', [TransaksiController::class, 'store'])->name('transaksi.store');
    Route::post('//transaksi/lunas/{id}', [TransaksiController::class, 'lunas'])->name('transaksi.lunas');
    Route::get('/members/search', [MemberController::class, 'search']);
    Route::post('member', [MemberController::class, 'store'])->name('member.store');
    Route::get('/admin', [AdminController::class, 'index'])->name('admin');
    Route::delete('/produk/{id}', [ProdukController::class, 'destroy'])->name('produk.destroy');
    Route::post('/produk/{id}', [ProdukController::class, 'update'])->name('produk.update');

});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';