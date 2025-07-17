<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DetailTransaksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('detail_transaksi')->insert([
            [
                'id' => 1,
                'transaksi_id' => 1,
                'produk_id' => 1,
                'qty' => 1,
                'harga' => 25000.00,
                'created_at' => '2025-07-11 07:41:40',
                'waktu_bayar' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 2,
                'transaksi_id' => 1,
                'produk_id' => 4,
                'qty' => 2,
                'harga' => 8000.00,
                'created_at' => '2025-07-11 07:41:40',
                'waktu_bayar' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 3,
                'transaksi_id' => 2,
                'produk_id' => 2,
                'qty' => 1,
                'harga' => 15000.00,
                'created_at' => '2025-07-11 07:41:40',
                'waktu_bayar' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 4,
                'transaksi_id' => 2,
                'produk_id' => 6,
                'qty' => 1,
                'harga' => 9000.00,
                'created_at' => '2025-07-11 07:41:40',
                'waktu_bayar' => '2025-07-11 07:41:40',
            ],
            [
                'id' => 5,
                'transaksi_id' => 2,
                'produk_id' => 5,
                'qty' => 1,
                'harga' => 12000.00,
                'created_at' => '2025-07-11 07:41:40',
                'waktu_bayar' => '2025-07-11 07:41:40',
            ],
        ]);
        
    }
}
