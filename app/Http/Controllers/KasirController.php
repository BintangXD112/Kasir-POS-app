<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Transaksi;
use Inertia\Inertia;
use Illuminate\Http\Request;

class KasirController extends Controller
{
    public function index()
    {
        $produk = Produk::all();
        $transaksi = Transaksi::all();
        return Inertia::render('kasir', [
            'produk' => $produk->toArray(),
            'transaksi' => $transaksi->toArray(),
        ]);
    }
} 