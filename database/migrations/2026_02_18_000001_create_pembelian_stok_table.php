<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembelian_stok', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('produk_id')->constrained('produk')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('jumlah');
            $table->decimal('harga_beli', 15, 2);
            $table->bigInteger('ongkir')->default(0);
            $table->decimal('total_harga', 15, 2);
            $table->bigInteger('nominal_bayar')->default(0);
            $table->string('keterangan')->nullable();
            $table->enum('status', ['draft', 'pending', 'lunas', 'failed', 'expired'])->default('draft');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembelian_stok');
    }
};
