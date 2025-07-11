<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detail_transaksi', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->unsignedBigInteger('transaksi_id');
            $table->unsignedBigInteger('produk_id');
            $table->integer('qty');
            $table->decimal('harga', 15, 2);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('detail_transaksi');
    }
}; 