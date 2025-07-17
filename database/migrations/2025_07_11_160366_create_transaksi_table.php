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
        Schema::create('transaksi', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->index('fk_transaksi_user');
            $table->foreignId('member_id')->nullable()->constrained('members')->onDelete('set null');
            $table->foreignId('diskon_id')->nullable()->constrained('diskons')->onDelete('set null');
            $table->string('kode_transaksi')->unique('kode_transaksi');
            $table->decimal('total', 15);
            $table->enum('metode_pembayaran', ['tunai', 'non-tunai', 'qris', 'lainnya']);
            $table->string('qris_ref_id')->nullable();
            $table->enum('status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
            $table->timestamp('created_at')->nullable();
            $table->timestamp('waktu_bayar')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
