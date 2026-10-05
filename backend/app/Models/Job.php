<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Job extends Model
{
    use HasFactory;

    /**
     * Default values for model attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        // Ensure newly created jobs default to the open status.
        'status' => 'open',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'title',
        'slug',
        'description',
        'role',
        'location',
        'type',
        'status',
        'expires_at',
    ];

    /**
     * Additional attributes to include in JSON representations.
     *
     * @var list<string>
     */
    protected $appends = [
        'type_label',
        'status_label',
        'is_expired',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the company that owns this job.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get all applications submitted for this job.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Get a French label for the job type.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'part_time' => 'Temps partiel',
            'freelance' => 'Freelance',
            'internship' => 'Stage',
            default => 'Temps plein',
        };
    }

    /**
     * Get a French label for the job status.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'closed' => 'Fermé',
            'draft' => 'Brouillon',
            default => 'Ouvert',
        };
    }

    /**
     * Determine whether the job has expired.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Scope a query to jobs that are open and not expired.
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query
            ->where('status', 'open')
            ->where(function (Builder $builder): void {
                $builder
                    ->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }
}
