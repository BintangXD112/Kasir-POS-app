<?php
use App\Http\Controllers\TabunganController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\KasirController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UsageDiskonController;
use App\Http\Controllers\JenisProdukController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\HutangController;
use App\Http\Controllers\PembelianStokController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\RekapController;
use Inertia\Inertia;


// Redirect berdasarkan login
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route(Auth::user()->tipe_user === 'admin' ? 'admin.dashboard' : 'kasir');
    }
    return redirect()->route('login');
})->name('home');


// Login & logout sudah didefinisikan di auth.php

// Route untuk user yang sudah login
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('admin/users', App\Http\Controllers\UserController::class);
    Route::get('admin/user-logs', [App\Http\Controllers\AdminController::class, 'userLogs'])->name('admin.user-logs');
    Route::get('admin/user-logs/export', [App\Http\Controllers\AdminController::class, 'exportUserLogs'])->name('admin.user-logs.export');
});

// ADD INERTIA MIDDLEWARE HERE
Route::middleware(['auth', \App\Http\Middleware\HandleInertiaRequests::class])->group(function () {
    // Kasir & Transaksi
    Route::get('/kasir', [KasirController::class, 'index'])->name('kasir.dashboard');
    Route::get('/beli', [KasirController::class, 'beli'])->name('kasir');
    Route::get('/transaksi', [TransaksiController::class, 'index'])->name('transaksi');
    Route::post('/transaksi', [TransaksiController::class, 'store'])->name('transaksi.store');
    Route::post('/transaksi/lunas/{id}', [TransaksiController::class, 'lunas'])->name('transaksi.lunas');

    // Rekap Dashboard
    Route::get('/rekap', [RekapController::class, 'index'])->name('rekap');
    
    // Member - FIXED ROUTES
    Route::get('/members/search', [MemberController::class, 'search'])->name('member.search');
    Route::delete('/member/{id}', [MemberController::class, 'destroy'])->name('member.destroy');
    Route::post('/member', [MemberController::class, 'store'])->name('member.store');
    Route::put('/member/{id}', [MemberController::class, 'update'])->name('member.update');
    Route::get('/members/{id}', [MemberController::class, 'show'])->name('member.show');
    Route::get('/member/list', [MemberController::class, 'list']);
    Route::get('/member', function () {
    return Inertia::render('member-kasir');
    });

    // ...stock...
    Route::get('/stock', [PembelianStokController::class, 'index']);
    Route::post('/stock', [PembelianStokController::class, 'store'])->name('stock.store');

    // Jenis Produk
    Route::post('/jenis_produk', [JenisProdukController::class, 'store'])->name('jenis_produk.store');
    Route::delete('/jenis_produk/{id}', [JenisProdukController::class, 'destroy'])->name('jenis_produk.destroy');
    Route::put('/jenis_produk/{id}', [JenisProdukController::class, 'update'])->name('jenis_produk.update');

    // Produk
    Route::post('/produk', [ProdukController::class, 'store'])->name('produk.store');
    Route::delete('/produk/{id}', [ProdukController::class, 'destroy'])->name('produk.destroy');
    Route::put('/produk/{id}', [ProdukController::class, 'update'])->name('produk.update');

    // Tabungan Member
    Route::get('/tabungan', [TabunganController::class, 'index'])->name('tabungan');
    Route::post('/tabungan', [TabunganController::class, 'store'])->name('tabungan.store');

    //supplier
    Route::prefix('supplier')->name('supplier.')->group(function () {
        Route::get('/', [SupplierController::class, 'index'])->name('index');
        Route::post('/', [SupplierController::class, 'store'])->name('store');
        Route::put('/{id}', [SupplierController::class, 'update'])->name('update');
        Route::delete('/{id}', [SupplierController::class, 'destroy'])->name('destroy');
    });

    // Rekap Hutang Member (kasir & admin)
    Route::get('/bayar', [HutangController::class, 'index'])->name('hutang.index');
    Route::post('/hutang/{id}/lunas', [HutangController::class, 'lunas'])->name('hutang.lunas');
    Route::post('/hutang/{id}/lunas', [HutangController::class, 'supplier'])->name('hutang.supplier');
    Route::post('/hutang/{memberId}/lunas-semua', [HutangController::class, 'lunasSemuaMember'])->name('hutang.lunas-semua');
    Route::get('/laporan-keuangan-supplier', [KasirController::class, 'laporanKeuanganSupplier'])->name('laporan.supplier');
    Route::get('/laporan/member/export', [RekapController::class, 'exportMember'])->name('laporan.member.export');
    Route::post('/pengeluaran', [RekapController::class, 'catatPengeluaran'])->name('pengeluaran.store');
    Route::get('/pengeluaran/export', [RekapController::class, 'exportPengeluaran'])->name('pengeluaran.export');
    Route::get('/laporan/supplier/export', [RekapController::class, 'exportSupplier'])->name('laporan.supplier.export');
    Route::get('/laporan-transaksi-member', [KasirController::class, 'laporanTransaksiMember'])->name('laporan.member');
    // Admin group
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('dashboard');
        Route::get('/transaksi', [AdminController::class, 'transaksiAdmin'])->name('transaksi');

        // Member Management
        Route::prefix('member')->group(function () {
            Route::get('/', [MemberController::class, 'indexJson'])->name('member.index');
            Route::put('{id}/level', [MemberController::class, 'updateLevel'])->name('member.voucher.update');
        });
        

    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';