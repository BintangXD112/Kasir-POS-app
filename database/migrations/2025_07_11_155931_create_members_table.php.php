<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->foreignId('member_level_id')->nullable()->constrained('member_levels')->onDelete('set null');
            $table->integer('total_transaksi')->default(0);
            $table->integer('total_transaksi_6bulan')->default(0);
            $table->timestamp('periode_dimulai')->nullable();
            $table->timestamp('terakhir_diskon_level5')->nullable(); // batasi diskon 1x/minggu
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
