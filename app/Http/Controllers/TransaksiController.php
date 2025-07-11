<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Inertia\Inertia;

class TransaksiController extends Controller
{
    public function index()
    {
        $transaksi = Transaksi::with(['detail.produk'])->get();
        return Inertia::render('transaksi', [
            'transaksi' => $transaksi,
        ]);
    }
} 