<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('chansons', function (Blueprint $table) {
            $table->id();
            $table->string('titre', 200);
            $table->string('duree', 10)->nullable();
            $table->string('fichier');
            $table->unsignedBigInteger('nombreEcoutes')->default(0);
            $table->foreignId('album_id')->nullable()->constrained('albums')->nullOnDelete();
            $table->foreignId('artist_id')->constrained('artist_profiles')->cascadeOnDelete();
            $table->string('cover')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('chansons'); }
};
