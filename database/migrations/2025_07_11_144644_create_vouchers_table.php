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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_level_id')->constrained()->onDelete('cascade');
            $table->string('nama')->nullable(); // contoh: Voucher 5% Penjajal Toko
            $table->decimal('persentase', 5, 2); // Contoh: 5.00 = 5%
            $table->integer('masa_aktif_hari'); // 1, 7, 30, dst.
            $table->boolean('sekali_pakai')->default(true); // bisa dipakai sekali atau tidak
            $table->boolean('eksklusif')->default(false); // hanya 1 voucher aktif (untuk sepuh)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
