<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    protected $fillable = ['titre', 'dateCreation', 'listener_id', 'cover'];

    public function listener() { return $this->belongsTo(ListenerProfile::class, 'listener_id'); }
    public function songs()    { return $this->belongsToMany(Chanson::class, 'chanson_playlist'); }
}
