<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    /**
     * Additional attributes to include in JSON representations.
     *
     * @var list<string>
     */
    protected $appends = [
        'status_label',
        'status_color',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'nom',
        'email',
        'role',
        'motivation',
        'portfolio',
        'cv',
        'score',
        'status',
    ];

    /**
     * Get the French label associated with the current status.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'reviewing' => 'En cours d\'examen',
            'interview' => 'Entretien prévu',
            'accepted' => 'Accepté',
            'rejected' => 'Refusé',
            default => 'En attente',
        };
    }

    /**
     * Get the color token associated with the current status.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'reviewing' => 'blue',
            'interview' => 'yellow',
            'accepted' => 'green',
            'rejected' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get the company that owns this application.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
