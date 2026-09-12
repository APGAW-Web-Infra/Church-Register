import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

interface AbsenteeRecord {
    id: number;
    member_name: string;
    reason?: string;
    service_type: string;
    service_date: string;
    status: string;
}

export default function AbsenteeBoard({ absentees, flash }: { absentees: AbsenteeRecord[]; flash?: { success?: string } }) {
    const { data, setData, post, processing } = useForm({
        member_name: '',
        reason: '',
        service_type: 'main_service',
        service_date: new Date().toISOString().slice(0, 10),
        status: 'absent',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/church-admin/absentees');
    };

    const displayAbsentees = absentees.slice(0, 18);
    const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

    return (
        <AuthenticatedLayout>
            <Head title="Absentee Board" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Service Visibility</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">Absentee Board</h1>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <section className="mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-[#080b18] p-5 text-white shadow-xl sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-300">6 × 3 attendance screen</p>
                            <h2 className="mt-2 text-2xl font-bold">People to follow up with</h2>
                        </div>
                        <p className="text-xs text-slate-400">Showing the latest {Math.min(displayAbsentees.length, 18)} records</p>
                    </div>

                    {displayAbsentees.length > 0 ? (
                        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                            {displayAbsentees.map((entry, index) => (
                                <div key={entry.id} className="group relative min-h-[128px] overflow-hidden border border-white/10 bg-white/[0.05] p-3 transition hover:-translate-y-1 hover:border-red-300/60 hover:bg-white/[0.09]">
                                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(248,113,113,0.5)_25%,rgba(248,113,113,0.5)_50%,transparent_50%,transparent_75%,rgba(248,113,113,0.5)_75%)] [background-size:8px_8px]" />
                                    <div className="relative z-10 flex h-full flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            <div className="grid h-12 w-12 grid-cols-3 grid-rows-3 gap-0.5 rounded-xl bg-red-500/20 p-1 shadow-[0_0_24px_rgba(248,113,113,0.16)]">
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((pixel) => <span key={pixel} className={`rounded-sm ${pixel % 2 === index % 2 ? 'bg-red-300' : 'bg-red-900/70'}`} />)}
                                            </div>
                                            <span className="font-mono text-[10px] text-red-300/70">0{index + 1}</span>
                                        </div>
                                        <div className="mt-4 min-w-0">
                                            <p className="truncate text-sm font-semibold text-white">{entry.member_name}</p>
                                            <div className="mt-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.1em] text-slate-500"><span>{initials(entry.member_name)}</span><span className={entry.status === 'excused' ? 'text-amber-300' : 'text-red-300'}>{entry.status}</span></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-5 border border-dashed border-white/15 px-5 py-10 text-center text-sm text-slate-400">The follow-up screen is clear. No absentee records have been added yet.</div>
                    )}
                </section>

                <div className="mb-8 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-2 text-lg font-semibold text-slate-900">Auto-generated absentee list</h2>
                    <p className="text-sm text-slate-600">Absentees are derived from the Sunday service register. If a member is not marked present, late, or excused for a service date, the record is automatically treated as absent.</p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-red-100 text-left">
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Member</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Service</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Date</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-red-50 bg-white">
                            {absentees.length > 0 ? absentees.map((entry) => (
                                <tr key={entry.id} className="hover:bg-red-50/40">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{entry.member_name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{entry.service_type.replace('_', ' ')}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{entry.service_date}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${entry.status === 'absent' ? 'bg-red-100 text-red-700' : entry.status === 'excused' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No absentees have been recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
