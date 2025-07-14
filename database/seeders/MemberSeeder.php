<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Member;
use Illuminate\Support\Carbon;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Default member
        Member::create([
            'nama' => 'Budi Default',
            'member_level_id' => null,
            'total_transaksi' => 0,
            'total_transaksi_6bulan' => 0,
            'periode_dimulai' => $now->copy()->subMonths(1),
            'terakhir_diskon_level5' => null,
        ]);

        // Langganan Toko
        Member::create([
            'nama' => 'Ani Langganan',
            'member_level_id' => 1,
            'total_transaksi' => 30,
            'total_transaksi_6bulan' => 26,
            'periode_dimulai' => $now->copy()->subMonths(2),
            'terakhir_diskon_level5' => null,
        ]);

        // Penjajal Toko
        Member::create([
            'nama' => 'Rudi Penjajal',
            'member_level_id' => 2,
            'total_transaksi' => 80,
            'total_transaksi_6bulan' => 60,
            'periode_dimulai' => $now->copy()->subMonths(3),
            'terakhir_diskon_level5' => null,
        ]);

        // Sobat Toko
        Member::create([
            'nama' => 'Siti Sobat',
            'member_level_id' => 3,
            'total_transaksi' => 130,
            'total_transaksi_6bulan' => 110,
            'periode_dimulai' => $now->copy()->subMonths(4),
            'terakhir_diskon_level5' => null,
        ]);

        // Donatur Toko
        Member::create([
            'nama' => 'Joko Donatur',
            'member_level_id' => 4,
            'total_transaksi' => 1500,
            'total_transaksi_6bulan' => 1200,
            'periode_dimulai' => $now->copy()->subMonths(5),
            'terakhir_diskon_level5' => null,
        ]);

        // Sepuh Toko
        Member::create([
            'nama' => 'Udin Sepuh',
            'member_level_id' => 5,
            'total_transaksi' => 10000,
            'total_transaksi_6bulan' => 300,
            'periode_dimulai' => $now->copy()->subMonths(6),
            'terakhir_diskon_level5' => $now->copy()->subDays(8),
        ]);

        // Menuju Langganan (20 transaksi dari 25)
        Member::create([
            'nama' => 'Dina Menuju Langganan',
            'member_level_id' => null,
            'total_transaksi' => 20,
            'total_transaksi_6bulan' => 20,
            'periode_dimulai' => $now->copy()->subMonths(2),
            'terakhir_diskon_level5' => null,
        ]);

        // Menuju Penjajal (48 transaksi dari 50)
        Member::create([
            'nama' => 'Ali Menuju Penjajal',
            'member_level_id' => 1,
            'total_transaksi' => 60,
            'total_transaksi_6bulan' => 48,
            'periode_dimulai' => $now->copy()->subMonths(3),
            'terakhir_diskon_level5' => null,
        ]);
    }
}
