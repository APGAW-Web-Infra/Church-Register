<?php

namespace App\Enum;

enum PermissionsEnum: string
{
    // System Administration
    case ViewUsers = 'view_users';
    case CreateUsers = 'create_users';
    case EditUsers = 'edit_users';
    case DeleteUsers = 'delete_users';
    case ImpersonateUsers = 'impersonate_users';

    // Role Management
    case ViewRoles = 'view_roles';
    case CreateRoles = 'create_roles';
    case EditRoles = 'edit_roles';
    case DeleteRoles = 'delete_roles';
    case ManageRoles = 'manage_roles';
    case SwitchRoles = 'switch_roles';

    // Permission Management
    case ViewPermissions = 'view_permissions';
    case EditPermissions = 'edit_permissions';

    // Dashboard Access - CPD (Current Primary Dashboard) - Universal Access
    case AccessCPD = 'access_cpd';
    case ViewDashboard = 'view_dashboard';
    case CustomizeDashboard = 'customize_dashboard';

    // Profile Management
    case ViewProfile = 'view_profile';
    case EditProfile = 'edit_profile';
    case UploadProfileImage = 'upload_profile_image';


    // Sunday School / Bible Study permissions
    case ManageSundaySchool = 'manage_sunday_school';
    case ViewSundaySchoolAttendance = 'view_sunday_school_attendance';
    case ManageSundaySchoolContent = 'manage_sunday_school_content';

    // Training Module Permissions (All Users)
    case AccessTraining = 'access_training';
    case EnrollCourses = 'enroll_courses';
    case ViewCourses = 'view_courses';
    case CompleteCourses = 'complete_courses';
    case ViewCertificates = 'view_certificates';
    case DownloadCertificates = 'download_certificates';
    case AccessHackathons = 'access_hackathons';
    case RegisterEvents = 'register_events';

    // Community Module Permissions
    case AccessCommunity = 'access_community';
    case JoinCommunities = 'join_communities';
    case CreateCommunities = 'create_communities';
    case ManageCommunities = 'manage_communities';
    case PostInForums = 'post_in_forums';
    case ModerateForums = 'moderate_forums';
    case AccessMentorship = 'access_mentorship';
    case RequestMentor = 'request_mentor';
    case BecomeMentor = 'become_mentor';

    // Document Management
    case ViewDocuments = 'view_documents';
    case UploadDocuments = 'upload_documents';
    case EditDocuments = 'edit_documents';
    case DeleteDocuments = 'delete_documents';
    case DownloadDocuments = 'download_documents';

    // Reporting and Analytics
    case ViewReports = 'view_reports';
    case GenerateReports = 'generate_reports';
    case ExportReports = 'export_reports';
    case ViewAnalytics = 'view_analytics';
    case ViewSystemMetrics = 'view_system_metrics';

    // Compliance and KYC
    case ViewKYC = 'view_kyc';
    case ManageKYC = 'manage_kyc';
    case VerifyAccounts = 'verify_accounts';
    case AccessAuditLogs = 'access_audit_logs';

    // Settings and System
    case ViewSettings = 'view_settings';
    case EditSettings = 'edit_settings';
    case ViewSystemLogs = 'view_system_logs';
    case ManageSystemSettings = 'manage_system_settings';

    // Basic Navigation
    case NavigateApplication = 'navigate_application';

    /**
     * Get permissions grouped by categories
     */
    public static function getPermissionGroups(): array
    {
        return [
            'System Administration' => [
                self::ViewUsers,
                self::CreateUsers,
                self::EditUsers,
                self::DeleteUsers,
                self::ImpersonateUsers,
                self::ViewRoles,
                self::CreateRoles,
                self::EditRoles,
                self::DeleteRoles,
                self::ManageRoles,
            ],
            'Dashboard & Profile' => [
                self::AccessCPD,
                self::ViewDashboard,
                self::CustomizeDashboard,
                self::ViewProfile,
                self::EditProfile,
                self::UploadProfileImage,
            ],
            'Training' => [
                self::AccessTraining,
                self::EnrollCourses,
                self::ViewCourses,
                self::CompleteCourses,
                self::ViewCertificates,
                self::AccessHackathons,
            ],
            'Community' => [
                self::AccessCommunity,
                self::JoinCommunities,
                self::PostInForums,
                self::AccessMentorship,
                self::RequestMentor,
            ],
        ];
    }

    /**
     * Get role-specific permissions
     */
    public static function getRolePermissions(RolesEnum $role): array
    {
        return match($role) {
            RolesEnum::SuperAdmin => array_map(fn($case) => $case->value, self::cases()),

            RolesEnum::Admin => [
                self::ViewUsers->value,
                self::EditUsers->value,
                self::ManageRoles->value,
                self::AccessCPD->value,
                self::ViewDashboard->value,
                self::ViewReports->value,
                self::GenerateReports->value,
                self::ViewAnalytics->value,
                self::ManageKYC->value,
                self::VerifyAccounts->value,
                self::AccessAuditLogs->value,
                self::ManageSundaySchool->value,
                self::ViewSundaySchoolAttendance->value,
                self::ManageSundaySchoolContent->value,
            ],

            RolesEnum::SundaySchoolTeacher => [
                self::AccessCPD->value,
                self::ViewDashboard->value,
                self::ViewProfile->value,
                self::EditProfile->value,
                self::AccessTraining->value,
                self::ViewCourses->value,
                self::EnrollCourses->value,
                self::CompleteCourses->value,
                self::ViewCertificates->value,
                self::AccessCommunity->value,
                self::JoinCommunities->value,
                self::PostInForums->value,
                self::ManageSundaySchool->value,
                self::ViewSundaySchoolAttendance->value,
                self::ManageSundaySchoolContent->value,
            ],

            RolesEnum::Individual => [
                self::AccessCPD->value,
                self::ViewDashboard->value,
                self::ViewProfile->value,
                self::EditProfile->value,
                self::NavigateApplication->value,
                self::AccessTraining->value,
                self::EnrollCourses->value,
                self::ViewCourses->value,
                self::CompleteCourses->value,
                self::ViewCertificates->value,
                self::AccessHackathons->value,
                self::RegisterEvents->value,
                self::AccessCommunity->value,
                self::JoinCommunities->value,
                self::PostInForums->value,
                self::AccessMentorship->value,
                self::RequestMentor->value,
            ],

            default => [
                self::NavigateApplication->value,
                self::ViewProfile->value,
            ],
        };
    }
}
