<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UsageDiskon;
use Inertia\Inertia;

class UsageDiskonController extends Controller
{
    public function index()
    {
        $usageDiskon = UsageDiskon::with('diskon', 'member')
            ->withCount('transaksi')
            ->get()
            ->map(function ($usageDiskon) {
                return [
                    'id' => $usageDiskon->id,
                    'kode_voucher' => $usageDiskon->diskon->kode_voucher ?? 0,
                    'kode_transaksi' => $usageDiskon->transaksi->kode_transaksi ?? null,
                    'member' => $usageDiskon->member->nama,
                    'waktu_transaksi' => $usageDiskon->waktu_transaksi,
                ];
            });
        return response()->json($usageDiskon);
    }
}
