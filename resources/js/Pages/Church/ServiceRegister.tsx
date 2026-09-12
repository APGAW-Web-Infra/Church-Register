import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface RegisterWeek {
    date: string;
    status?: string | null;
}

interface RegisterRow {
    id: number;
    name: string;
    referral_code?: string | null;
    weeks: RegisterWeek[];
}

export default function ServiceRegister({ month, monthLabel, sundays, rows, flash }: { month: string; monthLabel: string; sundays: string[]; rows: RegisterRow[]; flash?: { success?: string } }) {
    const updateMonth = (value: string) => {
        router.get(route('church-admin.service-register'), { month: value }, { preserveState: true, replace: true });
    };

    const markAttendance = (memberProfileId: number, week: number, status: string | null, selectedMonth: string) => {
        router.post(route('church-admin.service-register.attendance'), {
            member_profile_id: memberProfileId,
            month: selectedMonth,
            week,
            status,
        }, { preserveScroll: true });
    };

    const statusLabel = (status?: string | null) => status === 'present' ? 'P' : status === 'late' ? 'L' : status === 'absent' ? 'A' : status === 'excused' ? 'E' : '—';
    const statusClass = (status?: string | null) => status === 'present' ? 'bg-emerald-100 text-emerald-700' : status === 'late' ? 'bg-amber-100 text-amber-700' : status === 'absent' ? 'bg-rose-100 text-rose-700' : status === 'excused' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400';

    return (
        <AuthenticatedLayout>
            <Head title={`Service Register - ${monthLabel}`} />
            <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Church administration</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">Monthly Sunday Service Register</h1>
                        <p className="mt-2 text-sm text-slate-600">Record each member's main-service attendance by Sunday. Only church administrators can edit this register.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm font-semibold text-slate-700">Month<input type="month" value={month} onChange={(event) => updateMonth(event.target.value)} className="ml-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                        <Link href={route('church-admin.attendance')} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Attendance board</Link>
                    </div>
                </div>

                {flash?.success && <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{flash.success}</div>}

                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Register month</p><p className="mt-2 text-xl font-bold text-slate-900">{monthLabel}</p></div>
                    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active members</p><p className="mt-2 text-xl font-bold text-slate-900">{rows.length}</p></div>
                    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Sundays</p><p className="mt-2 text-xl font-bold text-slate-900">{sundays.length} service dates</p></div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-600"><span className="font-semibold text-slate-700">Status:</span><span><b className="mr-1 rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">P</b> Present</span><span><b className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">L</b> Late</span><span><b className="mr-1 rounded bg-rose-100 px-1.5 py-0.5 text-rose-700">A</b> Absent</span><span><b className="mr-1 rounded bg-slate-200 px-1.5 py-0.5 text-slate-700">E</b> Excused</span></div>

                <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left">
                            <thead>
                                <tr className="bg-red-50">
                                    <th className="sticky left-0 z-10 border-b border-r border-red-100 bg-red-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Member</th>
                                    <th className="border-b border-r border-red-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Referral code</th>
                                    {[1, 2, 3, 4, 5].map((week) => <th key={week} className="border-b border-red-100 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Week {week}<span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-slate-500">{sundays[week - 1] ? new Date(`${sundays[week - 1]}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Sunday'}</span></th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? rows.map((row) => <tr key={row.id} className="group hover:bg-red-50/40">
                                    <td className="sticky left-0 z-[1] border-b border-r border-red-50 bg-white px-4 py-3 text-sm font-semibold text-slate-800 group-hover:bg-red-50/40">{row.name}</td>
                                    <td className="border-b border-r border-red-50 px-4 py-3 font-mono text-xs text-slate-500">{row.referral_code || '—'}</td>
                                    {[0, 1, 2, 3, 4].map((index) => <td key={index} className="border-b border-red-50 px-3 py-2 text-center">{row.weeks[index] ? <div className="flex items-center justify-center gap-1"><button type="button" title="Present" onClick={() => markAttendance(row.id, index + 1, 'present', month)} className={`h-8 w-8 rounded-lg text-xs font-bold ${row.weeks[index].status === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'}`}>P</button><button type="button" title="Late" onClick={() => markAttendance(row.id, index + 1, 'late', month)} className={`h-8 w-8 rounded-lg text-xs font-bold ${row.weeks[index].status === 'late' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-700'}`}>L</button><button type="button" title="Absent" onClick={() => markAttendance(row.id, index + 1, 'absent', month)} className={`h-8 w-8 rounded-lg text-xs font-bold ${row.weeks[index].status === 'absent' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-700'}`}>A</button><button type="button" title="Excused" onClick={() => markAttendance(row.id, index + 1, 'excused', month)} className={`h-8 w-8 rounded-lg text-xs font-bold ${row.weeks[index].status === 'excused' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}>E</button><span className={`ml-1 inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-1 text-xs font-bold ${statusClass(row.weeks[index].status)}`}>{statusLabel(row.weeks[index].status)}</span></div> : <span className="text-xs text-slate-300">—</span>}</td>)}
                                </tr>) : <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">No active members are available for this register.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
                <p className="mt-4 text-xs text-slate-500">Only active members appear in the register. Any member left unmarked is automatically recorded as absent for that Sunday and pushed into the absentee follow-up list.</p>
            </div>
        </AuthenticatedLayout>
    );
}
