<?php

namespace App\Enum;

enum RolesEnum: string
{
    // Church member and ministry roles
    case Individual = 'individual';

    // Church administration roles
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case SundaySchoolTeacher = 'sunday_school_teacher';

    public static function labels(): array
    {
        return [
            self::Individual => 'Church Member',
            self::SuperAdmin => 'Church Super Administrator',
            self::Admin => 'Church Administrator',
            self::SundaySchoolTeacher => 'Sunday School Teacher',
        ];
    }

    public function label(): string
    {
        return match($this) {
            self::Individual => 'Church Member',
            self::SuperAdmin => 'Church Super Administrator',
            self::Admin => 'Church Administrator',
            self::SundaySchoolTeacher => 'Sunday School Teacher',
        };
    }

    /**
     * Church-only role set; no extra application roles remain.
     */
    public static function getSpecializedRoles(): array
    {
        return [];
    }

    /**
     * Get primary dashboard roles (everyone starts here)
     */
    public static function getPrimaryDashboardRoles(): array
    {
        return array_keys(self::labels());
    }

    /**
     * Check if role can apply for additional roles
     */
    public function canApplyForAdditionalRoles(): bool
    {
        return false;
    }
}
