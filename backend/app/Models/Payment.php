<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'fedapay_transaction_id',
        'fedapay_customer_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'plan',
        'period_start',
        'period_end',
        'metadata',
        'paid_at',
    ];

    /**
     * The attributes that should be appended for serialization.
     *
     * @var list<string>
     */
    protected $appends = [
        'amount_formatted',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'period_start' => 'date',
            'period_end' => 'date',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * Get the company that owns the payment.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Format amount from centimes to FCFA.
     */
    public function getAmountFormattedAttribute(): string
    {
        return number_format($this->amount / 100, 0, ',', ' ').' FCFA';
    }

    /**
     * Scope a query to only approved payments.
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only pending payments.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }
}
