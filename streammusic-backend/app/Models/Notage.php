<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notage extends Model
{
    protected $fillable = ['note', 'listener_id', 'chanson_id'];

    protected $casts = ['note' => 'integer'];

    public function listener() { return $this->belongsTo(ListenerProfile::class, 'listener_id'); }
    public function chanson()  { return $this->belongsTo(Chanson::class, 'chanson_id'); }
}
