<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CompanyMember extends Model
{
    protected $fillable = [
        'company_id',
        'email',
        'name',
        'password',
        'api_token',
        'invite_token',
        'status',
    ];

    protected $hidden = ['password', 'api_token', 'invite_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function generateToken(): string
    {
        do {
            $token = Str::random(60);
        } while (self::where('api_token', $token)->exists());

        $this->forceFill(['api_token' => $token])->save();

        return $token;
    }
}
