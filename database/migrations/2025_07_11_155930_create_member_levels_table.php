<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('member_levels', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->unsignedTinyInteger('prioritas')->default(0); // urutan level
            $table->integer('target_transaksi_6bulan')->default(0); // syarat naik ke level ini
            $table->integer('checkpoint_transaksi')->default(0); // reset jika gagal naik ke level selanjutnya
            $table->decimal('diskon', 5, 2)->default(0); // misal 3.00 = 3%
            $table->boolean('hadiah_fisik')->default(false);
            $table->boolean('bisa_dipakai_selamanya')->default(false); // untuk level Sepuh
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_levels');
    }
};
