<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    protected $fillable = ['titre', 'dateSortie', 'artist_id', 'cover'];

    public function artist() { return $this->belongsTo(ArtistProfile::class, 'artist_id'); }
    public function songs()  { return $this->hasMany(Chanson::class, 'album_id'); }
}
