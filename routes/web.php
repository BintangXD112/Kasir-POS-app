<?php
use App\Http\Controllers\TabunganController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\KasirController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProdukController;

// Redirect berdasarkan login
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route(Auth::user()->tipe_user === 'admin' ? 'admin.dashboard' : 'kasir');
    }
    return redirect()->route('login');
});

// Halaman login inertia
Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('login');

// Logout
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// Route untuk user yang sudah login
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('admin/users', App\Http\Controllers\UserController::class);
    Route::get('admin/user-logs', [App\Http\Controllers\AdminController::class, 'userLogs'])->name('admin.user-logs');
    Route::get('admin/user-logs/export', [App\Http\Controllers\AdminController::class, 'exportUserLogs'])->name('admin.user-logs.export');
});

// ADD INERTIA MIDDLEWARE HERE
Route::middleware(['auth', \App\Http\Middleware\HandleInertiaRequests::class])->group(function () {
    // Kasir & Transaksi
    Route::get('/kasir', [KasirController::class, 'index'])->name('kasir');
    Route::get('/transaksi', [TransaksiController::class, 'index'])->name('transaksi');
    Route::post('/transaksi', [TransaksiController::class, 'store'])->name('transaksi.store');
    Route::post('/transaksi/lunas/{id}', [TransaksiController::class, 'lunas'])->name('transaksi.lunas');
    
    // Member - FIXED ROUTES
    Route::get('/members/search', [MemberController::class, 'search'])->name('member.search');
    Route::delete('/member/{id}', [MemberController::class, 'destroy'])->name('member.destroy');
    Route::post('/member', [MemberController::class, 'store'])->name('member.store');
    Route::put('/member/{id}', [MemberController::class, 'update'])->name('member.update');
    
    // Produk
    Route::post('/produk', [ProdukController::class, 'store'])->name('produk.store');
    Route::delete('/produk/{id}', [ProdukController::class, 'destroy'])->name('produk.destroy');
    Route::put('/produk/{id}', [ProdukController::class, 'update'])->name('produk.update');
    
    // Tabungan Member
    Route::post('/tabungan', [TabunganController::class, 'store'])->name('tabungan.store');
    
    // Admin group
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('dashboard');
        Route::get('/voucher-usage', [AdminController::class, 'voucherUsage'])->name('voucher.usage');
        Route::get('/transaksi', [AdminController::class, 'transaksiAdmin'])->name('transaksi');
        
        // Voucher Diskon
        Route::prefix('voucher-diskon')->group(function () {
            Route::get('/', [AdminController::class, 'voucherDiskonIndex'])->name('voucher.index');
            Route::post('/', [AdminController::class, 'voucherDiskonStore'])->name('voucher.store');
            Route::put('/{id}', [AdminController::class, 'voucherDiskonUpdate'])->name('voucher.update');
            Route::delete('/{id}', [AdminController::class, 'voucherDiskonDestroy'])->name('voucher.destroy');
        });
        
        // Member Management
        Route::prefix('member')->group(function () {
            Route::get('/', [MemberController::class, 'indexJson'])->name('member.index');
            Route::put('{id}/voucher', [MemberController::class, 'updateVoucher'])->name('member.voucher.update');
        });
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';