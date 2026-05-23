<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chanson extends Model
{
    protected $fillable = [
        'titre', 'duree', 'fichier', 'nombreEcoutes',
        'album_id', 'artist_id', 'cover',
    ];

    protected $casts = ['nombreEcoutes' => 'integer'];

    public function album()     { return $this->belongsTo(Album::class); }
    public function artist()    { return $this->belongsTo(ArtistProfile::class, 'artist_id'); }
    public function playlists() { return $this->belongsToMany(Playlist::class, 'chanson_playlist'); }
    public function notages()   { return $this->hasMany(Notage::class, 'chanson_id'); }

    public function averageRating(): float
    {
        return (float) ($this->notages()->avg('note') ?? 0);
    }
}
