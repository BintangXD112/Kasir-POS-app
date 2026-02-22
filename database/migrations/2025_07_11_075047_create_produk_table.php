<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produk', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('id_jenis_produk'); // foreign key
            $table->string('nama');
            $table->integer('harga');
            $table->integer('stok')->default(0);
            $table->string('gambar')->nullable();
            $table->timestamps();

            $table->foreign('id_jenis_produk')
                  ->references('id')
                  ->on('jenis_produk')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produk');
    }
};
