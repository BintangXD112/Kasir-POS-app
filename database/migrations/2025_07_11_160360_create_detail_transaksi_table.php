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
        Schema::create('detail_transaksi', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('transaksi_id')->index('fk_detail_transaksi_transaksi');
            $table->unsignedBigInteger('produk_id')->index('fk_detail_transaksi_produk');
            $table->integer('qty');
            $table->decimal('harga', 15);
            $table->timestamp('created_at')->nullable();
            $table->timestamp('waktu_bayar')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_transaksi');
    }
};
