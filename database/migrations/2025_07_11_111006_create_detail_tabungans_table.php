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
        Schema::create('tabungan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('member_id')->unique(); // 1 member 1 tabungan
            $table->decimal('saldo', 12, 2)->default(0);
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_tabungans');
    }
};
