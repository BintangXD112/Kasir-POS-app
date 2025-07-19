<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detail_tabungan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tabungan_id');
            $table->enum('tipe', ['deposit', 'penarikan', 'dari_kembalian', 'penggunaan']);
            $table->decimal('nominal', 12, 2);
            $table->string('keterangan')->nullable();
            $table->string('kode_transaksi')->default('-')->nullable();
            $table->timestamps();

            $table->foreign('tabungan_id')->references('id')->on('tabungan')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabungans');
    }
};
