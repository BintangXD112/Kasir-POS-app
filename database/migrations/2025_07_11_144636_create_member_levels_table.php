<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('member_levels', function (Blueprint $table) {
            $table->id();
            $table->enum('nama', [
                'Langganan Toko',
                'Penjajal Toko',
                'Sobat Toko',
                'Donatur Toko',
                'Sepuh Toko',
            ]);
            $table->integer('minimal_belanja')->default(0); // Jumlah transaksi per bulan
            $table->integer('minimal_barang')->default(0); // Jumlah barang per bulan
            $table->integer('prioritas')->default(0); // Level tertinggi = angka terbesar
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_levels');
    }
};
