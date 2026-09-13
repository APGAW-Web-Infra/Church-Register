<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'profile_complete',
        'profile_completed_at',
    ];

    protected function casts(): array
    {
        return [
            'skills_of_interest' => 'array',
            'profile_complete' => 'boolean',
            'profile_completed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if profile is complete based on user role
     */
    public function isCompleteForRole(string $role): bool
    {
        return match($role) {
            'individual', 'sunday_school_teacher', 'super_admin', 'admin' => $this->isIndividualProfileComplete(),
            default => false,
        };
    }

    /**
     * Mark profile as complete
     */
    public function markAsComplete(): void
    {
        $this->update([
            'profile_complete' => true,
            'profile_completed_at' => now(),
        ]);
    }

    /**
     * Get completion percentage
     */
    public function getCompletionPercentage(string $role): int
    {
        $requiredFields = $this->getRequiredFieldsForRole($role);
        $completedFields = 0;

        foreach ($requiredFields as $field) {
            if (!empty($this->$field)) {
                $completedFields++;
            }
        }

        return $requiredFields ? round(($completedFields / count($requiredFields)) * 100) : 0;
    }

    /**
     * Get missing fields for role completion
     */
    public function getMissingFieldsForRole(string $role): array
    {
        $requiredFields = $this->getRequiredFieldsForRole($role);
        $missingFields = [];

        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                $missingFields[] = $field;
            }
        }

        return $missingFields;
    }

    /**
     * Private methods for role-specific completion checks
     */
    private function isIndividualProfileComplete(): bool
    {
        return !empty($this->description);
    }

    /**
     * Get required fields for each role
     */
    private function getRequiredFieldsForRole(string $role): array
    {
        return match($role) {
            'individual', 'sunday_school_teacher', 'super_admin', 'admin' => ['description'],
            default => [],
        };
    }

}
