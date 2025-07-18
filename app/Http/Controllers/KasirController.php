<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KasirController extends Controller
{
    public function index()
    {
        return Inertia::render('kasir', [
            'produk' => Produk::all(),
            'transaksi' => Transaksi::all(),
        ]);
    }
}
