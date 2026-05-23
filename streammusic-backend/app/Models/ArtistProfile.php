<?php
// ─────────────────────────────────────────────────────────────
// ArtistProfile.php
// ─────────────────────────────────────────────────────────────
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArtistProfile extends Model
{
    protected $fillable = ['user_id', 'nomArtiste', 'bio', 'photo'];

    public function user()      { return $this->belongsTo(User::class); }
    public function albums()    { return $this->hasMany(Album::class, 'artist_id'); }
    public function songs()     { return $this->hasMany(Chanson::class, 'artist_id'); }
}
