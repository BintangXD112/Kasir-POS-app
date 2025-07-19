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
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nama_user');
            $table->enum('tipe_user', ['admin', 'kasir']);
            $table->string('kode_user')->unique('kode_user');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
            $table->enum('status', ['active', 'non-active'])->default('active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
