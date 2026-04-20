<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'slug',
        'logo',
        'color',
        'api_token',
        'is_suspended',
        'plan',
        'plan_expires_at',
        'impersonate_token',
        'impersonate_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'api_token',
        'impersonate_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_suspended' => 'boolean',
            'plan_expires_at' => 'datetime',
            'impersonate_expires_at' => 'datetime',
        ];
    }

    /**
     * Get all applications that belong to this company.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Get all jobs that belong to this company.
     */
    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class);
    }

    /**
     * Build a URL-friendly slug from a company name.
     */
    public static function generateSlug(string $name): string
    {
        return Str::slug($name);
    }

    /**
     * Generate and persist a unique API token for this company.
     */
    public function generateToken(): string
    {
        do {
            $token = Str::random(60);
        } while (self::where('api_token', $token)->exists());

        $this->forceFill(['api_token' => $token])->save();

        return $token;
    }
}
