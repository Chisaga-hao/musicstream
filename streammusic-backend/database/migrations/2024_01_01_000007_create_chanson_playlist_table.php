<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('chanson_playlist', function (Blueprint $table) {
            $table->foreignId('chanson_id')->constrained('chansons')->cascadeOnDelete();
            $table->foreignId('playlist_id')->constrained('playlists')->cascadeOnDelete();
            $table->primary(['chanson_id', 'playlist_id']);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('chanson_playlist'); }
};
