<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DetailTransaksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        DB::table('detail_transaksi')->insert([
            [
                'transaksi_id' => 1,
                'produk_id' => 1,
                'qty' => 2,
                'harga' => 50000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'transaksi_id' => 1,
                'produk_id' => 2,
                'qty' => 1,
                'harga' => 50000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'transaksi_id' => 2,
                'produk_id' => 1,
                'qty' => 1,
                'harga' => 20000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
} 