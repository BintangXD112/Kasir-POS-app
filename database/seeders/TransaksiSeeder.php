<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransaksiSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('transaksi')->insert([
            [
                'id' => 1,
                'user_id' => 2,
                'jenis' => 'masuk', // penjualan ke member
                'member_id' => 1,
                'supplier_id' => null,
                'kode_transaksi' => 'TRX001',
                'total' => 41000.00,
                'metode_pembayaran' => 'tunai',
                'qris_ref_id' => null,
                'status' => 'lunas',
                'created_at' => '2025-07-11 07:41:40',
                'waktu_bayar' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 2,
                'user_id' => 2,
                'jenis' => 'masuk', // penjualan ke member
                'member_id' => 2,
                'supplier_id' => null,
                'kode_transaksi' => 'TRX002',
                'total' => 36000.00,
                'metode_pembayaran' => 'qris',
                'qris_ref_id' => 'QRIS123',
                'status' => 'lunas',
                'created_at' => '2025-07-11 07:41:40',
                'waktu_bayar' => '2025-07-11 07:41:40',
            ],
        ]);
    }
}