<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->string('titre', 150);
            $table->date('dateCreation')->nullable();
            $table->foreignId('listener_id')->constrained('listener_profiles')->cascadeOnDelete();
            $table->string('cover')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('playlists'); }
};
