import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  PencilIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  IdentificationIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { User, Role } from '@/types/user';
import ModernLayout from '@/Layouts/Training/TrainingLayout';

interface UserShowProps extends PageProps {
  user: User;
}

const StatusBadge: React.FC<{ user: User }> = ({ user }) => {
  const getConfig = () => {
    if (user.email_verified_at) {
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300',
        ring: 'ring-red-200',
        icon: <CheckBadgeIcon className="w-4 h-4" />
      };
    }
    return {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      ring: 'ring-yellow-200',
      icon: <ExclamationTriangleIcon className="w-4 h-4" />
    };
  };

  const config = getConfig();

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}>
      {config.icon}
      {user.email_verified_at ? 'Email Verified' : 'Email Unverified'}
    </span>
  );
};

const RegistrationStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getConfig = () => {
    switch (status.toLowerCase()) {
      case 'verified':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-700 dark:text-red-300',
          ring: 'ring-red-200',
          label: 'Verified Account'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-700 dark:text-yellow-300',
          ring: 'ring-yellow-200',
          label: 'Pending Review'
        };
      case 'suspended':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-700 dark:text-red-300',
          ring: 'ring-red-200',
          label: 'Account Suspended'
        };
      case 'rejected':
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-700 dark:text-gray-300',
          ring: 'ring-gray-200',
          label: 'Registration Rejected'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-700 dark:text-gray-300',
          ring: 'ring-gray-200',
          label: status
        };
    }
  };

  const config = getConfig();

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}>
      {config.label}
    </span>
  );
};

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'super_admin':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'manager':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getRoleColor(role.name)}`}>
      <ShieldCheckIcon className="w-4 h-4" />
      {role.name.replace('_', ' ').toUpperCase()}
    </span>
  );
};

const InfoCard: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 shadow-sm ${className}`}>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        {title}
      </h3>
      {children}
    </div>
  );
};

const DetailItem: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        {icon}
        {label}
      </div>
      <div className="text-sm text-gray-900 dark:text-white font-medium sm:text-right">
        {value || <span className="text-gray-400 dark:text-gray-500">Not provided</span>}
      </div>
    </div>
  );
};

const UserShow: React.FC<UserShowProps> = ({ user }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFullName = () => {
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    return user.name;
  };

  const getInitials = () => {
    if (user.firstname && user.lastname) {
      return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
    }

    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const getEducationLabel = (level: string) => {
    const labels: Record<string, string> = {
      primary: 'Primary Education',
      secondary: 'Secondary Education',
      diploma: 'Diploma',
      bachelors: "Bachelor's Degree",
      masters: "Master's Degree",
      phd: 'PhD/Doctorate'
    };
    return labels[level] || level;
  };

  return (
        <ModernLayout>
          <Head title={`${user.name} - User Details`} />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={route('users.index')}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base"
            >
              <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Back to Users
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {user.profpix ? (
                  <img
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg ring-2 ring-gray-200 dark:ring-gray-600"
                    src={user.profpix}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg ring-2 ring-gray-200 dark:ring-gray-600">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {getInitials()}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
                  {getFullName()}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-1">
                  @{user.name.toLowerCase().replace(/\s+/g, '')}
                </p>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
                  <StatusBadge user={user} />
                  <RegistrationStatusBadge status={user.registration_status} />
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                    <a href={`mailto:${user.email}`} className="hover:text-red-500 break-all">
                      {user.email}
                    </a>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                      <a href={`tel:${user.phone}`} className="hover:text-red-500">
                        {user.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={route('users.edit', user.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm"
              >
                <PencilIcon className="w-4 h-4" />
                Edit User
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <InfoCard title="Personal Information">
              <div className="space-y-0">
                <DetailItem
                  label="Full Name"
                  value={getFullName()}
                  icon={<UserIcon className="w-4 h-4" />}
                />

                <DetailItem
                  label="Username"
                  value={`@${user.name.toLowerCase().replace(/\s+/g, '')}`}
                />

                {user.firstname && (
                  <DetailItem
                    label="First Name"
                    value={user.firstname}
                  />
                )}

                {user.lastname && (
                  <DetailItem
                    label="Last Name"
                    value={user.lastname}
                  />
                )}

                <DetailItem
                  label="Email Address"
                  value={
                    <a href={`mailto:${user.email}`} className="text-red-600 dark:text-red-400 hover:underline break-all">
                      {user.email}
                    </a>
                  }
                  icon={<EnvelopeIcon className="w-4 h-4" />}
                />

                <DetailItem
                  label="Phone Number"
                  value={
                    user.phone ? (
                      <a href={`tel:${user.phone}`} className="text-red-600 dark:text-red-400 hover:underline">
                        {user.phone}
                      </a>
                    ) : null
                  }
                  icon={<PhoneIcon className="w-4 h-4" />}
                />

                {user.date_of_birth && (
                  <DetailItem
                    label="Date of Birth"
                    value={formatDateOnly(user.date_of_birth)}
                    icon={<CalendarIcon className="w-4 h-4" />}
                  />
                )}

                {user.education_level && (
                  <DetailItem
                    label="Education Level"
                    value={getEducationLabel(user.education_level)}
                    icon={<AcademicCapIcon className="w-4 h-4" />}
                  />
                )}

                <DetailItem
                  label="Email Verification"
                  value={user.email_verified_at ? (
                    <span className="text-red-600 dark:text-red-400">
                      Verified on {formatDate(user.email_verified_at)}
                    </span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">
                      Not verified
                    </span>
                  )}
                />
              </div>
            </InfoCard>

            {/* Location & Professional Info */}
            <InfoCard title="Location & Professional Information">
              <div className="space-y-0">
                {user.sector && (
                  <DetailItem
                    label="Sector"
                    value={user.sector}
                    icon={<BriefcaseIcon className="w-4 h-4" />}
                  />
                )}

                {user.state && (
                  <DetailItem
                    label="State"
                    value={user.state}
                    icon={<MapPinIcon className="w-4 h-4" />}
                  />
                )}

                {user.lga && (
                  <DetailItem
                    label="Local Government Area"
                    value={user.lga}
                  />
                )}

                {user.address && (
                  <DetailItem
                    label="Address"
                    value={user.address}
                  />
                )}

                {user.skills_of_interest && user.skills_of_interest.length > 0 && (
                  <DetailItem
                    label="Skills of Interest"
                    value={
                      <div className="flex flex-wrap gap-1 justify-end">
                        {user.skills_of_interest.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    }
                  />
                )}
              </div>
            </InfoCard>

            {/* Identity Information */}
            {(user.nin || user.passport_number) && (
              <InfoCard title="Identity Information">
                <div className="space-y-0">
                  {user.nin && (
                    <DetailItem
                      label="NIN"
                      value={user.nin}
                      icon={<IdentificationIcon className="w-4 h-4" />}
                    />
                  )}

                  {user.passport_number && (
                    <DetailItem
                      label="Passport Number"
                      value={user.passport_number}
                      icon={<IdentificationIcon className="w-4 h-4" />}
                    />
                  )}
                </div>
              </InfoCard>
            )}

            {/* Roles and Permissions */}
            <InfoCard title={`Roles & Permissions (${user.roles.length})`}>
              {user.roles.length > 0 ? (
                <div className="space-y-3">
                  {user.roles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 flex-shrink-0">
                          <ShieldCheckIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {role.name.replace('_', ' ').toUpperCase()}
                          </div>
                          {role.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {role.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No roles assigned</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This user has no roles assigned yet.
                  </p>
                </div>
              )}
            </InfoCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Account Status */}
            <InfoCard title="Account Status" className="bg-gray-50 dark:bg-gray-900">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Registration Status</p>
                  <RegistrationStatusBadge status={user.registration_status} />
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Email Verification</p>
                  <StatusBadge user={user} />
                </div>

                {user.verified_at && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Verified</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(user.verified_at)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Community Rank</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    #{user.community_rank || 'N/A'}
                  </p>
                </div>
              </div>
            </InfoCard>

            {/* Timeline */}
            <InfoCard title="Timeline">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      User Created
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                </div>

                {user.updated_at !== user.created_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        Last Updated
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        {formatDate(user.updated_at)}
                      </div>
                    </div>
                  </div>
                )}

                {user.email_verified_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        Email Verified
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <CheckBadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        {formatDate(user.email_verified_at)}
                      </div>
                    </div>
                  </div>
                )}

                {user.verified_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        Account Verified
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <CheckBadgeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        {formatDate(user.verified_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Quick Actions */}
            <InfoCard title="Quick Actions" className="bg-gray-50 dark:bg-gray-900">
              <div className="space-y-2">
                <Link
                  href={route('users.edit', user.id)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit User Information
                </Link>

                <a
                  href={`mailto:${user.email}`}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  Send Email
                </a>

                {user.phone && (
                  <a
                    href={`tel:${user.phone}`}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    Call User
                  </a>
                )}
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
        </ModernLayout>
  );
};

export default UserShow;
