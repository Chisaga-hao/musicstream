<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('notages', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('note')->unsigned(); // 0 to 5
            $table->foreignId('listener_id')->constrained('listener_profiles')->cascadeOnDelete();
            $table->foreignId('chanson_id')->constrained('chansons')->cascadeOnDelete();
            $table->unique(['listener_id', 'chanson_id']); // one rating per song per user
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('notages'); }
};
