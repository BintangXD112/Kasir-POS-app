<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pembelian_stok', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('user_id')->constrained('supplier')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pembelian_stok', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
        });
    }
};
