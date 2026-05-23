<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'username', 'nom', 'prenom', 'photo',
        'modepass', 'email', 'dateN',
        'compteActif', 'role',
    ];

    protected $hidden = ['modepass', 'remember_token'];

    protected $casts = [
        'compteActif' => 'boolean',
        'dateN'       => 'date',
    ];

    /**
     * FIX: Laravel's Auth uses "password" by default.
     * We renamed it "modepass", so we override this method.
     */
    public function getAuthPassword(): string
    {
        return $this->modepass;
    }

    /**
     * FIX: Also needed for Laravel 11+ Sanctum token hashing
     */
    public function getAuthPasswordName(): string
    {
        return 'modepass';
    }

    // Relations
    public function listenerProfile() { return $this->hasOne(ListenerProfile::class); }
    public function artistProfile()   { return $this->hasOne(ArtistProfile::class); }

    // Helpers
    public function isArtist(): bool { return in_array($this->role, ['artist', 'admin']); }
    public function isAdmin(): bool  { return $this->role === 'admin'; }
}
