<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username', 50)->unique();
            $table->string('nom', 100)->nullable();
            $table->string('prenom', 100)->nullable();
            $table->string('photo')->nullable();
            $table->string('modepass');          // password field (renamed from "password")
            $table->string('email')->unique();
            $table->date('dateN')->nullable();
            $table->boolean('compteActif')->default(true);
            $table->enum('role', ['listener', 'artist', 'admin'])->default('listener');
            $table->rememberToken();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};
