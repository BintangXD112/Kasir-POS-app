<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique(); // misal: VCHR3PERCENT
            $table->foreignId('member_level_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('diskon', 5, 2)->default(0); // % diskon (misal 2.50)
            $table->date('masa_aktif_mulai');
            $table->date('masa_aktif_selesai');
            $table->unsignedTinyInteger('maksimal_pakai')->default(1); // berapa kali bisa dipakai
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};

