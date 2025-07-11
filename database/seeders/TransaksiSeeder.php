<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransaksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('transaksi')->insert([
            [
                'id' => 1,
                'user_id' => 2,
                'kode_transaksi' => 'TRX001',
                'total' => 41000.00,
                'metode_pembayaran' => 'tunai',
                'qris_ref_id' => null,
                'status' => 'paid',
                'waktu_bayar' => '2025-07-11 07:41:40',
                'created_at' => '2025-07-11 07:41:40',
                'updated_at' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 2,
                'user_id' => 2,
                'kode_transaksi' => 'TRX002',
                'total' => 36000.00,
                'metode_pembayaran' => 'qris',
                'qris_ref_id' => 'QRIS123',
                'status' => 'paid',
                'waktu_bayar' => '2025-07-11 07:41:40',
                'created_at' => '2025-07-11 07:41:40',
                'updated_at' => '2025-07-11 07:41:40',
            ],
        ]);
        
    }
}
