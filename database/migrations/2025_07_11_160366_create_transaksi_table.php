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
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('jenis', ['masuk', 'keluar']);
            // masuk = beli dari supplier
            // keluar = jual ke member

            $table->foreignId('member_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('supplier')->nullOnDelete();

            $table->string('kode_transaksi')->unique()->nullable();
            $table->decimal('total', 15, 2)->default(0);

            $table->enum('metode_pembayaran', ['tunai', 'non-tunai', 'qris', 'lainnya'])->nullable();
            $table->string('qris_ref_id')->nullable();

            $table->enum('status', ['draft', 'pending', 'lunas', 'failed', 'expired'])->default('draft');

            $table->timestamp('waktu_bayar')->nullable();
            $table->timestamps();
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
