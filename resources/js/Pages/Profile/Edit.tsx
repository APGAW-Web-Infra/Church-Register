import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ErrorBoundary from '@/Components/ErrorBoundary';
import { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    sector?: string;
    primary_role: string;
    registration_status: string;
    date_of_birth?: string;
    education_level?: string;
    skills_of_interest?: string[];
    state?: string;
    lga?: string;
    nin?: string;
    passport_number?: string;
    community_rank?: number;
    active_roles?: string[];
    referral_code?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    profile?: UserProfile;
}

interface UserProfile {
    id: number;
    user_id: number;
    description?: string;
    bio?: string;
    skills_of_interest?: string[];
    profession?: string;
    experience_level?: string;
    availability?: string;
    profile_complete?: boolean;
    profile_completed_at?: string;
}

interface DashboardContext {
    current_role: string;
    role_label: string;
    available_roles: string[];
    can_switch_roles: boolean;
    active_roles: string[];
    has_cpd_access: boolean;
}

interface SelectOption {
    id: string;
    name: string;
    description?: string;
}

interface EditProps extends PageProps {
    auth: {
        user: User;
    };
    mustVerifyEmail: boolean;
    status?: string;
    user: User;
    dashboardContext: DashboardContext;
    sectors: SelectOption[];
    educationLevels: SelectOption[];
    states: SelectOption[];
    memberProfilePhotoUrl?: string | null;
}

export default function Edit({
    auth,
    mustVerifyEmail,
    status,
    user,
    dashboardContext,
    sectors,
    educationLevels,
    states,
    memberProfilePhotoUrl
}: EditProps) {
    const [activeSection, setActiveSection] = React.useState<string>('profile');
    const [pageLoaded, setPageLoaded] = React.useState<boolean>(false);

    // Ensure user has a profile object (for rendering safety)
    const safeUser = React.useMemo(() => ({
        ...user,
        profile: user.profile || {
            id: 0,
            user_id: user.id,
            description: undefined,
            bio: undefined,
            skills_of_interest: undefined,
            profession: undefined,
            experience_level: undefined,
            availability: undefined,
            profile_complete: false,
            profile_completed_at: undefined,
        }
    }), [user]);

    // Debug logging
    React.useEffect(() => {
        console.log('Profile Edit page mounted');
        console.log('Dashboard Context:', dashboardContext);
        console.log('User Profile:', safeUser.profile);
        console.log('User object:', user);
        setPageLoaded(true);
    }, [dashboardContext, safeUser, user]);

    const sections = [
        {
            id: 'profile',
            name: 'Profile Information',
            description: 'Update your personal information and contact details'
        },
        {
            id: 'security',
            name: 'Security',
            description: 'Update your password and security settings'
        },
        {
            id: 'account',
            name: 'Account Management',
            description: 'Export data or delete your account'
        }
    ];

    const getProfileCompletion = () => {
        if (!user.profile) return { percentage: 0, isComplete: false };

        const requiredFields = getRequiredFieldsForRole(user.primary_role);
        const completedFields = requiredFields.filter(field => {
            const value = user.profile?.[field as keyof UserProfile] || user[field as keyof User];
            return value !== null && value !== undefined && value !== '';
        });

        const percentage = requiredFields.length > 0 ? Math.round((completedFields.length / requiredFields.length) * 100) : 100;
        return { percentage, isComplete: percentage === 100 };
    };

    const getRequiredFieldsForRole = (role: string): string[] => {
        switch (role) {
            case 'sunday_school_teacher':
                return ['name', 'email', 'phone', 'address'];
            default:
                return ['name', 'email', 'phone', 'address'];
        }
    };

    const completion = getProfileCompletion();

    return (
        <ErrorBoundary>
            <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Profile Settings
                </h2>
            }
        >
            <Head title="Profile Settings" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Settings
                                    </h3>
                                </div>
                                <nav className="space-y-1 p-2">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`${
                                                activeSection === section.id
                                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200'
                                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                            } group w-full flex items-start px-3 py-2 text-sm font-medium border rounded-md transition-colors`}
                                        >
                                            <div className="flex-1 text-left">
                                                <div className="font-medium">{section.name}</div>
                                                <div className="text-xs opacity-75 mt-1">{section.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="mt-6 lg:mt-0 lg:col-span-9">
                            {!pageLoaded && (
                                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                    <div className="text-center">
                                        <div className="inline-block">
                                            <div className="inline-flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="text-gray-600 dark:text-gray-400">Loading profile...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-6">
                                {/* Profile Information Section */}
                                {activeSection === 'profile' && pageLoaded && (
                                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                                        <UpdateProfileInformationForm
                                            mustVerifyEmail={mustVerifyEmail}
                                            status={status}
                                            className="p-6"
                                            user={safeUser}
                                            sectors={sectors}
                                            educationLevels={educationLevels}
                                            states={states}
                                            memberProfilePhotoUrl={memberProfilePhotoUrl}
                                        />
                                    </div>
                                )}

                                {/* Security Section */}
                                {activeSection === 'security' && pageLoaded && (
                                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                                        <UpdatePasswordForm className="p-6" />
                                    </div>
                                )}

                                {/* Account Management Section */}
                                {activeSection === 'account' && pageLoaded && (
                                    <div className="space-y-6">
                                        {/* Data Export */}
                                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                                            <header className="mb-6">
                                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                    Export Your Data
                                                </h2>
                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                    Download all your data from the APGA Worldwide platform.
                                                </p>
                                            </header>

                                            <button
                                                onClick={() => router.get(route('profile.export-data'))}
                                                className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-red-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 dark:hover:bg-red-600 focus:bg-red-700 dark:focus:bg-red-600 active:bg-red-800 dark:active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-red-900 transition ease-in-out duration-150"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Export Data
                                            </button>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </AuthenticatedLayout>
        </ErrorBoundary>
    );
}
