import { useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface SelectOption {
    id: string;
    name: string;
    description?: string;
}

interface DashboardContext {
    current_role: string;
    role_label: string;
    available_roles: string[];
    can_switch_roles: boolean;
    active_roles: string[];
    has_cpd_access: boolean;
}

interface User {
    id: number;
    name: string;
    primary_role: string;
    active_roles?: string[];
    profile?: any;
}

const ROLE_REQUIREMENTS: Record<string, {
    fields: string[];
    title: string;
    description: string;
}> = {
    'individual': {
        title: 'Church Member Profile',
        description: 'Keep your personal details and church profile information current.',
        fields: ['name', 'email', 'phone', 'address', 'description']
    },
    'sunday_school_teacher': {
        title: 'Sunday School Teacher Profile',
        description: 'Update your teaching details and serving availability for the children and youth ministry.',
        fields: ['name', 'email', 'phone', 'address', 'teaching_area', 'class_level', 'lesson_focus']
    },
    'admin': {
        title: 'Church Administrator Profile',
        description: 'Keep your account and ministry admin details up to date.',
        fields: ['name', 'email', 'phone', 'address']
    }
};

export default function RoleApplicationForm({
    className = '',
    user,
    dashboardContext,
    availableRoles = [],
}: {
    className?: string;
    user: User;
    dashboardContext: DashboardContext;
    availableRoles: SelectOption[];
}) {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [showApplication, setShowApplication] = useState(false);
    const [applicationStep, setApplicationStep] = useState(1);
    const [profileCompleteness, setProfileCompleteness] = useState<Record<string, number>>({});

    const { data, setData, post, errors, processing, recentlySuccessful, reset } = useForm<{
        role: string;
        confirm_eligibility: boolean;
    }>({
        role: '',
        confirm_eligibility: false,
    });

    // Safely ensure data
    const roles = Array.isArray(availableRoles) ? availableRoles : [];
    const dashCtx = dashboardContext || { role_label: 'Unknown', active_roles: [], current_role: '' };

    const getProfileCompleteness = (roleId: string): number => {
        const requirements = ROLE_REQUIREMENTS[roleId];
        if (!requirements || !user.profile) return 0;

        const filledFields = requirements.fields.filter(field => {
            const value = user.profile?.[field];
            return value !== null && value !== undefined && value !== '';
        }).length;

        return Math.round((filledFields / requirements.fields.length) * 100);
    };

    const handleRoleSelection = (roleId: string) => {
        setSelectedRole(roleId);
        setShowApplication(true);
        setApplicationStep(1);
        setData('role', roleId);
        setProfileCompleteness({...profileCompleteness, [roleId]: getProfileCompleteness(roleId)});
    };

    const submitApplication: FormEventHandler = (e) => {
        e.preventDefault();
        if (applicationStep === 1) {
            setApplicationStep(2);
        } else {
            post(route('profile.apply-for-role'), {
                onSuccess: () => {
                    setShowApplication(false);
                    setSelectedRole(null);
                    setApplicationStep(1);
                    reset();
                },
            });
        }
    };

    const switchRole = (roleId: string) => {
        router.post(route('profile.switch-role'), { role: roleId });
    };

    return (
        <section className={className}>
            <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Church Role Management
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Review your current church access and keep your ministry profile information accurate.
                </p>
            </div>

            {/* Current Role Status */}
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Current Active Role: {dashCtx.role_label}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    You currently have access to the {dashCtx.role_label} dashboard and its features.
                </p>
                {dashCtx.active_roles && dashCtx.active_roles.length > 1 && (
                    <div className="mt-3">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-2">
                            Switch to other active roles:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {dashCtx.active_roles
                                .filter(role => role !== dashCtx.current_role)
                                .map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => switchRole(role)}
                                        className="px-2.5 py-1 bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 text-xs font-medium rounded border border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        Switch to {role.replace('_', ' ')}
                                    </button>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Active Church Roles */}
            {roles.length > 0 ? (
                <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                        Active Church Roles ({roles.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {roles.map((role) => {
                            const completeness = profileCompleteness[role.id] || getProfileCompleteness(role.id);
                            return (
                                <div
                                    key={role.id}
                                    className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-all flex flex-col"
                                >
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                            {role.name}
                                        </h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 opacity-75 mt-1">
                                            {role.description}
                                        </p>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Profile Completeness</span>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{completeness}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${
                                                    completeness >= 80 ? 'bg-red-500' :
                                                    completeness >= 50 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${completeness}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRoleSelection(role.id)}
                                        className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 font-medium text-sm transition-colors"
                                    >
                                        Review Role
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Application Form Modal */}
                    {showApplication && selectedRole && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {ROLE_REQUIREMENTS[selectedRole]?.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Step {applicationStep} of 2
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowApplication(false);
                                            setSelectedRole(null);
                                            setApplicationStep(1);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={submitApplication} className="p-6 space-y-6">
                                    {applicationStep === 1 ? (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Role Overview</h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {ROLE_REQUIREMENTS[selectedRole]?.description}
                                                </p>
                                            </div>

                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-3">Required Information</h4>
                                                <ul className="space-y-2">
                                                    {ROLE_REQUIREMENTS[selectedRole]?.fields.map((field, idx) => (
                                                        <li key={idx} className="text-sm text-red-800 dark:text-red-200 flex items-start">
                                                            <span className="mr-3">•</span>
                                                            <span>{field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                                <div className="flex items-start">
                                                    <input
                                                        type="checkbox"
                                                        id="confirm_eligibility"
                                                        checked={data.confirm_eligibility}
                                                        onChange={(e) => setData('confirm_eligibility', e.target.checked)}
                                                        className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                    />
                                                    <label htmlFor="confirm_eligibility" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                                        I confirm that I meet the requirements for this role and will complete the necessary profile information.
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Application Confirmation</h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                                    Please review the information below before submitting your application:
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                                                <div>
                                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Applicant Name</label>
                                                    <p className="text-sm text-gray-900 dark:text-white">{user.name}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Applying for</label>
                                                    <p className="text-sm text-gray-900 dark:text-white">{roles.find(r => r.id === selectedRole)?.name}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Profile Completeness</label>
                                                    <p className="text-sm text-gray-900 dark:text-white">{profileCompleteness[selectedRole] || 0}%</p>
                                                </div>
                                            </div>

                                            {errors.role && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.role}</p>
                                                </div>
                                            )}

                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                    Your application will be reviewed and you'll receive an update within 48-72 hours.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 pt-4">
                                        {applicationStep === 2 && (
                                            <button
                                                type="button"
                                                onClick={() => setApplicationStep(1)}
                                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-medium"
                                            >
                                                Back
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={processing || (applicationStep === 1 && !data.confirm_eligibility)}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
                                        >
                                            {processing ? 'Processing...' : (applicationStep === 1 ? 'Continue' : 'Submit Application')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowApplication(false);
                                                setSelectedRole(null);
                                                setApplicationStep(1);
                                                reset();
                                            }}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    {recentlySuccessful && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                                ✓ Application submitted successfully! You'll receive an update soon.
                                            </p>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                        No Additional Roles Available
                    </h3>
                    {dashCtx.current_role?.toLowerCase().includes('admin') || dashCtx.current_role?.toLowerCase().includes('support') ? (
                        <>
                            <p className="text-red-800 dark:text-red-200 mb-2">
                                System administrators cannot apply for additional roles.
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300">
                                If you need to switch to a different system role, please contact the system administrator.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-red-800 dark:text-red-200 mb-2">
                                You currently have access to all available roles in the APGA Worldwide system.
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300">
                                Complete your profile to unlock additional opportunities as they become available.
                            </p>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}
