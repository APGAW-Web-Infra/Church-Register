import React from 'react';
import { Link } from '@inertiajs/react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  EllipsisVerticalIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { PaginatedUsers, UserFilterParams, User, Role } from '@/types/user';

interface UserTableProps {
  users: PaginatedUsers;
  onFilterChange: (filters: Partial<UserFilterParams>) => void;
  currentFilters: UserFilterParams;
}

const StatusBadge: React.FC<{ user: User }> = ({ user }) => {
  const getConfig = () => {
    // Email verification status
    if (user.email_verified_at) {
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300',
        icon: <CheckBadgeIcon className="w-3.5 h-3.5" />,
        label: 'Verified'
      };
    }
    return {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: <ExclamationTriangleIcon className="w-3.5 h-3.5" />,
      label: 'Unverified'
    };
  };

  const config = getConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
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
          label: 'Verified'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-700 dark:text-yellow-300',
          label: 'Pending'
        };
      case 'suspended':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-700 dark:text-red-300',
          label: 'Suspended'
        };
      case 'rejected':
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-700 dark:text-gray-300',
          label: 'Rejected'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-700 dark:text-gray-300',
          label: status
        };
    }
  };

  const config = getConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role.name)}`}>
      <ShieldCheckIcon className="w-3 h-3" />
      {role.name.replace('_', ' ').toUpperCase()}
    </span>
  );
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onFilterChange,
  currentFilters
}) => {
  const handleSort = (field: string) => {
    const direction =
      currentFilters.sort_field === field && currentFilters.sort_direction === 'asc'
        ? 'desc'
        : 'asc';

    onFilterChange({
      sort_field: field,
      sort_direction: direction,
    });
  };

  const handlePerPageChange = (perPage: number) => {
    onFilterChange({ per_page: perPage });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFullName = (user: User): string => {
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    return user.name;
  };

  const getInitials = (user: User): string => {
    if (user.firstname && user.lastname) {
      return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
    }

    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const SortIcon: React.FC<{ field: string }> = ({ field }) => {
    if (currentFilters.sort_field !== field) {
      return <div className="w-4 h-4" />;
    }

    return currentFilters.sort_direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  const DropdownMenu: React.FC<{ user: User }> = ({ user }) => (
    <div className="relative inline-block text-left group">
      <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>

      <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
        <div className="py-1">
          <Link
            href={route('users.show', user.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <EyeIcon className="w-4 h-4" />
            View Details
          </Link>
          <Link
            href={route('users.edit', user.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <PencilIcon className="w-4 h-4" />
            Edit User
          </Link>
          {user.email && (
            <a
              href={`mailto:${user.email}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <EnvelopeIcon className="w-4 h-4" />
              Send Email
            </a>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <Link
            href={route('users.destroy', user.id)}
            method="delete"
            as="button"
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e: any) => {
              if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                e.preventDefault();
              }
            }}
          >
            <TrashIcon className="w-4 h-4" />
            Delete User
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Table Header with Controls */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing {users.from || 0} to {users.to || 0} of {users.total} users
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Show:</label>
              <select
                value={currentFilters.per_page || 10}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  User
                  <SortIcon field="name" />
                </div>
              </th>

              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-1">
                  Contact
                  <SortIcon field="email" />
                </div>
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Location
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Roles
              </th>

              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => handleSort('email_verified_at')}
              >
                <div className="flex items-center gap-1">
                  Email Status
                  <SortIcon field="email_verified_at" />
                </div>
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Registration
              </th>

              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  Joined
                  <SortIcon field="created_at" />
                </div>
              </th>

              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.data.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                {/* User Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {user.profpix ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                          src={user.profpix}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                          <span className="text-sm font-semibold text-white">
                            {getInitials(user)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        <Link
                          href={route('users.show', user.id)}
                          className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          {getFullName(user)}
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{user.name.toLowerCase().replace(/\s+/g, '')}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4">
                  {user.state || user.lga ? (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{user.state}{user.lga ? `, ${user.lga}` : ''}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>

                {/* Roles */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length > 0 ? (
                      user.roles.slice(0, 2).map((role) => (
                        <RoleBadge key={role.id} role={role} />
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">No roles</span>
                    )}
                    {user.roles.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">+{user.roles.length - 2}</span>
                    )}
                  </div>
                </td>

                {/* Email Status */}
                <td className="px-6 py-4">
                  <StatusBadge user={user} />
                </td>

                {/* Registration Status */}
                <td className="px-6 py-4">
                  <RegistrationStatusBadge status={user.registration_status} />
                </td>

                {/* Joined Date */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                    {formatDate(user.created_at)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <DropdownMenu user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {users.data.map((user) => (
          <div key={user.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0">
                {user.profpix ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                    src={user.profpix}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                    <span className="text-sm font-semibold text-white">
                      {getInitials(user)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={route('users.show', user.id)}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 block truncate"
                >
                  {getFullName(user)}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @{user.name.toLowerCase().replace(/\s+/g, '')}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <StatusBadge user={user} />
                  <RegistrationStatusBadge status={user.registration_status} />
                </div>
              </div>
              <DropdownMenu user={user} />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}
              {(user.state || user.lga) && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{user.state}{user.lga ? `, ${user.lga}` : ''}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
            </div>

            {user.roles.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Roles</p>
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <RoleBadge key={role.id} role={role} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {users.data.length === 0 && (
        <div className="text-center py-12 px-4">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No users match your current filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {users.last_page > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
              Showing {users.from || 0} to {users.to || 0} of {users.total} results
            </div>

            <nav className="flex items-center gap-2 overflow-x-auto max-w-full">
              {users.links.map((link, index) => {
                if (!link.url) {
                  return (
                    <span
                      key={index}
                      className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  );
                }

                return (
                  <Link
                    key={index}
                    href={link.url}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                      link.active
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default UserTable;
