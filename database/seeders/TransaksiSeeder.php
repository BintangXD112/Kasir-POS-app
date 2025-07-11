<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TransaksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        DB::table('transaksi')->insert([
            [
                'user_id' => 1,
                'kode_transaksi' => Str::uuid(),
                'total' => 150000,
                'metode_pembayaran' => 'tunai',
                'qris_ref_id' => null,
                'status' => 'paid',
                'waktu_bayar' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'user_id' => 1,
                'kode_transaksi' => Str::uuid(),
                'total' => 200000,
                'metode_pembayaran' => 'qris',
                'qris_ref_id' => 'QRIS123456',
                'status' => 'pending',
                'waktu_bayar' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'user_id' => 2,
                'kode_transaksi' => Str::uuid(),
                'total' => 50000,
                'metode_pembayaran' => 'qris',
                'qris_ref_id' => 'QRIS654321',
                'status' => 'paid',
                'waktu_bayar' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
} 