import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

interface Member {
    id: number;
    first_name?: string;
    last_name?: string;
    name: string;
    phone?: string;
    membership_status: string;
    department?: string;
    unit?: string;
    is_active: boolean;
    email?: string;
    avatar_url?: string | null;
}

export default function MemberDirectory({ members, flash, departments, filters }: { members: Member[]; flash?: { success?: string }; departments?: string[]; filters?: { search?: string; status?: string; membership_status?: string; department?: string } }) {
    const { data, setData, post, processing } = useForm<{
        first_name: string;
        last_name: string;
        phone: string;
        gender: string;
        membership_status: string;
        department: string;
        unit: string;
        is_active: boolean;
    }>({
        first_name: '',
        last_name: '',
        phone: '',
        gender: 'male',
        membership_status: 'member',
        department: '',
        unit: '',
        is_active: true,
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/church-admin/members');
    };

    const handleFilterChange = (key: 'search' | 'status' | 'membership_status' | 'department', value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        window.location.href = `${window.location.pathname}?${params.toString()}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Church Member Directory" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Members</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">Church Member Directory</h1>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="mb-8 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Add a member</h2>
                    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <label className="text-sm font-medium text-slate-700">
                            First name
                            <input
                                type="text"
                                value={data.first_name}
                                onChange={(event) => setData('first_name', event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                                required
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Last name
                            <input
                                type="text"
                                value={data.last_name}
                                onChange={(event) => setData('last_name', event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                                required
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Phone
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(event) => setData('phone', event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Gender
                            <select
                                value={data.gender}
                                onChange={(event) => setData('gender', event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) => setData('is_active', Boolean(event.target.checked))}
                                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                            />
                            Active member
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Membership status
                            <select
                                value={data.membership_status}
                                onChange={(event) => setData('membership_status', event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            >
                                <option value="member">Member</option>
                                <option value="first_timer">First Timer</option>
                                <option value="visitor">Visitor</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Department
                            <input
                                type="text"
                                value={data.department}
                                onChange={(event) => setData('department', event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Unit
                            <input
                                type="text"
                                value={data.unit}
                                onChange={(event) => setData('unit', event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            />
                        </label>
                        <div className="flex items-end md:col-span-2 xl:col-span-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-red-300"
                            >
                                {processing ? 'Saving...' : 'Add Member'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mb-6 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-3">
                        <label className="text-sm font-medium text-slate-700">
                            Search members
                            <input
                                type="text"
                                defaultValue={filters?.search ?? ''}
                                onChange={(event) => handleFilterChange('search', event.target.value)}
                                placeholder="Search by name, phone, department..."
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Status
                            <select
                                value={filters?.status ?? ''}
                                onChange={(event) => handleFilterChange('status', event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            >
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Membership
                            <select value={filters?.membership_status ?? ''} onChange={(event) => handleFilterChange('membership_status', event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                                <option value="">All membership types</option>
                                <option value="member">Member</option>
                                <option value="first_timer">First timer</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-700">
                            Department
                            <select
                                value={filters?.department ?? ''}
                                onChange={(event) => handleFilterChange('department', event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-red-400 focus:outline-none"
                            >
                                <option value="">All departments</option>
                                {(departments ?? []).map((department) => (
                                    <option key={department} value={department}>{department}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-red-100 text-left">
                            <thead className="bg-red-50">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Name</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Email</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Phone</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Department</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Unit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-50 bg-white">
                                {members.length > 0 ? members.map((member) => (
                                    <tr key={member.id} className="hover:bg-red-50/50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-800"><div className="flex items-center gap-3">{member.avatar_url ? <img src={member.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">{member.name.slice(0, 1).toUpperCase()}</span>}<span>{member.name}</span></div></td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{member.email ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{member.phone ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                                                {member.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{member.department ?? '—'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{member.unit ?? '—'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                            No members match the current search filters.
                                        </td>
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
