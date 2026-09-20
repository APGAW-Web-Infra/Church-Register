import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface UserRow {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    state?: string;
    sector?: string;
    registration_status?: string;
    is_verified?: boolean;
    roles?: string[];
    created_at?: string;
    member_profile_id?: number;
}

export default function UserManagement({ users, roles, filters, flash }: { users: UserRow[]; roles: string[]; filters?: { search?: string; role?: string }; flash?: { success?: string; error?: string } }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [selectedRole, setSelectedRole] = useState(filters?.role ?? '');
    const [editingId, setEditingId] = useState<number | null>(null);

    const currentUser = users.find((user) => user.id === editingId) ?? null;

    const form = useForm({
        name: currentUser?.name ?? '',
        email: currentUser?.email ?? '',
        phone: currentUser?.phone ?? '',
        state: currentUser?.state ?? '',
        sector: currentUser?.sector ?? '',
        registration_status: currentUser?.registration_status ?? 'verified',
        role: currentUser?.roles?.[0] ?? 'individual',
    });

    useMemo(() => {
        if (currentUser) {
            form.setData({
                name: currentUser.name,
                email: currentUser.email ?? '',
                phone: currentUser.phone ?? '',
                state: currentUser.state ?? '',
                sector: currentUser.sector ?? '',
                registration_status: currentUser.registration_status ?? 'verified',
                role: currentUser.roles?.[0] ?? 'individual',
            });
        }
    }, [currentUser]);

    const applyFilters = (nextSearch: string, nextRole: string) => {
        const params = new URLSearchParams(window.location.search);

        if (nextSearch) {
            params.set('search', nextSearch);
        } else {
            params.delete('search');
        }

        if (nextRole) {
            params.set('role', nextRole);
        } else {
            params.delete('role');
        }

        router.get(route('church-admin.users'), Object.fromEntries(params.entries()), {
            preserveState: true,
            replace: true,
        });
    };

    const submitUpdate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingId) {
            return;
        }

        router.patch(route('church-admin.users.update', editingId), form.data, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const deleteUser = (userId: number) => {
        if (!window.confirm('Delete this user profile? This action cannot be undone.')) {
            return;
        }

        router.delete(route('church-admin.users.delete', userId));
    };

    const promoteUser = (userId: number, role: string) => {
        router.post(route('church-admin.users.promote', userId), { role }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Management" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Admin</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">User management</h1>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {flash.error}
                    </div>
                )}

                <div className="mb-6 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-slate-700">
                            Search users
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setSearch(value);
                                    applyFilters(value, selectedRole);
                                }}
                                placeholder="Search by name, email, phone or location"
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            />
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Role filter
                            <select
                                value={selectedRole}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setSelectedRole(value);
                                    applyFilters(search, value);
                                }}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            >
                                <option value="">All roles</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {editingId && currentUser && (
                    <div className="mb-8 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold text-slate-900">Edit user</h2>
                            <button type="button" onClick={() => setEditingId(null)} className="text-sm font-medium text-slate-500">Close</button>
                        </div>

                        <form onSubmit={submitUpdate} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <label className="text-sm font-medium text-slate-700">
                                Full name
                                <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="text-sm font-medium text-slate-700">
                                Email
                                <input value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="text-sm font-medium text-slate-700">
                                Phone
                                <input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="text-sm font-medium text-slate-700">
                                State
                                <input value={form.data.state} onChange={(event) => form.setData('state', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="text-sm font-medium text-slate-700">
                                Sector
                                <input value={form.data.sector} onChange={(event) => form.setData('sector', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="text-sm font-medium text-slate-700">
                                User status
                                <select value={form.data.registration_status} onChange={(event) => form.setData('registration_status', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </label>
                            <label className="text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-1">
                                Role
                                <select value={form.data.role} onChange={(event) => form.setData('role', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                                    <option value="individual">Member</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </label>

                            <div className="flex items-end md:col-span-2 xl:col-span-3">
                                <button type="submit" className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white">Save changes</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-red-100 text-left">
                            <thead className="bg-red-50">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Role</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Email</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Phone</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">State</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-50 bg-white">
                                {users.length > 0 ? users.map((user) => (
                                    <tr key={user.id} className="hover:bg-red-50/50">
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{user.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{(user.roles ?? []).join(', ') || 'individual'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{user.email ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{user.phone ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{user.state ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {user.registration_status ?? (user.is_verified ? 'verified' : 'pending')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex flex-wrap gap-2">
                                                <button type="button" onClick={() => setEditingId(user.id)} className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">Edit</button>
                                                <button type="button" onClick={() => promoteUser(user.id, 'admin')} className="rounded-full bg-amber-100 px-3 py-1.5 font-medium text-amber-700">Promote admin</button>
                                                <button type="button" onClick={() => deleteUser(user.id)} className="rounded-full bg-rose-100 px-3 py-1.5 font-medium text-rose-700">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
