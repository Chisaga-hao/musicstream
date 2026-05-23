<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ListenerProfile extends Model
{
    protected $fillable = ['user_id'];

    public function user()      { return $this->belongsTo(User::class); }
    public function playlists() { return $this->hasMany(Playlist::class, 'listener_id'); }
    public function notages()   { return $this->hasMany(Notage::class, 'listener_id'); }
}
