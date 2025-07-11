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
        Schema::table('detail_transaksi', function (Blueprint $table) {
            $table->foreign(['produk_id'], 'fk_detail_transaksi_produk')->references(['id'])->on('produk')->onUpdate('restrict')->onDelete('cascade');
            $table->foreign(['transaksi_id'], 'fk_detail_transaksi_transaksi')->references(['id'])->on('transaksi')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detail_transaksi', function (Blueprint $table) {
            $table->dropForeign('fk_detail_transaksi_produk');
            $table->dropForeign('fk_detail_transaksi_transaksi');
        });
    }
};
