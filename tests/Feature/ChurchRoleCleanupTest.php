<?php

namespace Tests\Feature;

use App\Enum\RolesEnum;
use Tests\TestCase;

class ChurchRoleCleanupTest extends TestCase
{
    public function test_only_church_roles_remain_active(): void
    {
        $this->assertSame(
            [
                'individual',
                'super_admin',
                'admin',
                'sunday_school_teacher',
            ],
            array_map(fn (RolesEnum $role) => $role->value, RolesEnum::cases())
        );
    }

    public function test_profile_forms_do_not_contain_stale_business_role_fields(): void
    {
        $profileForm = file_exists(base_path('resources/js/Pages/Profile/Partials/UpdateBusinessProfileForm.tsx'))
            ? file_get_contents(base_path('resources/js/Pages/Profile/Partials/UpdateBusinessProfileForm.tsx'))
            : '';
        $roleForm = file_get_contents(base_path('resources/js/Pages/Profile/Partials/RoleApplicationForm.tsx'));

        foreach (['startup', 'sme_owner', 'investor_type', 'preferred_sectors', 'institutional_partner', 'trainer_mentor_expert', 'business_stage'] as $term) {
            $this->assertStringNotContainsString($term, $profileForm, 'Stale non-church profile fields should not remain in the church profile form.');
            $this->assertStringNotContainsString($term, $roleForm, 'Stale non-church role logic should not remain in the role application form.');
        }
    }

    public function test_church_profile_backend_and_forms_do_not_expose_stale_business_fields(): void
    {
        $profileController = file_get_contents(base_path('app/Http/Controllers/ProfileController.php'));
        $profileRequest = file_get_contents(base_path('app/Http/Requests/ProfileUpdateRequest.php'));
        $userProfile = file_get_contents(base_path('app/Models/UserProfile.php'));
        $profileForm = file_exists(base_path('resources/js/Pages/Profile/Partials/UpdateBusinessProfileForm.tsx'))
            ? file_get_contents(base_path('resources/js/Pages/Profile/Partials/UpdateBusinessProfileForm.tsx'))
            : '';

        foreach (['business_name', 'website', 'linkedin_profile'] as $term) {
            $this->assertStringNotContainsString($term, $profileController, 'Stale business-style profile payload fields should not remain in the church profile controller.');
            $this->assertStringNotContainsString($term, $profileRequest, 'Stale business-style profile validation fields should not remain in the church profile request.');
            $this->assertStringNotContainsString($term, $userProfile, 'Stale business-style profile model fillable fields should not remain in the church profile model.');
            $this->assertStringNotContainsString($term, $profileForm, 'Stale business-style profile form fields should not remain in the church profile form.');
        }
    }

    public function test_church_route_and_page_tree_do_not_expose_stale_funding_investor_wallet_logic(): void
    {
        $routes = file_get_contents(base_path('routes/web.php'));
        $publicPageController = file_get_contents(base_path('app/Http/Controllers/PublicPageController.php'));

        foreach (['funding', 'FundingController', 'vcMatches', 'WalletController', 'wallets', 'transactions', 'fundingApplications'] as $term) {
            $this->assertStringNotContainsString($term, $routes, 'Stale non-church funding, investor, wallet, VC, and transaction routes should not remain in the church routes file.');
        }

        foreach (['funding', 'FundingController', 'wallets', 'transactions', 'fundingApplications', 'vcMatches'] as $term) {
            $this->assertStringNotContainsString($term, $publicPageController, 'Stale non-church public page controller wiring should not remain in the public page controller.');
        }
    }
}
