import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface RegisterWeek {
    date: string;
    status?: string | null;
    first_timer?: boolean | null;
}

interface RegisterRow {
    id: number;
    name: string;
    referral_code?: string | null;
    weeks: RegisterWeek[];
}

interface ServiceTypeOption {
    value: string;
    label: string;
}

export default function ServiceRegister({
    month,
    monthLabel,
    serviceType,
    serviceTypes,
    serviceDates,
    rows,
    attendanceStats,
    members,
    flash,
}: {
    month: string;
    monthLabel: string;
    serviceType: string;
    serviceTypes: ServiceTypeOption[];
    serviceDates: string[];
    rows: RegisterRow[];
    attendanceStats?: { service_type_total?: number; total?: number; present_or_late?: number; first_timers?: number; sunday_school?: number; main_service?: number; latest_service_date?: string | null; latest_service_total?: number };
    members: { id: number; name: string }[];
    flash?: { success?: string };
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const visibleRows = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (!normalizedSearch) {
            return rows;
        }

        return rows.filter((row) => {
            const nameMatches = row.name.toLowerCase().includes(normalizedSearch);
            const referralMatches = (row.referral_code ?? '').toLowerCase().includes(normalizedSearch);

            return nameMatches || referralMatches;
        });
    }, [rows, searchTerm]);

    const updateMonth = (value: string) => {
        const params: Record<string, string> = { month: value, service_type: serviceType };
        router.get(route('church-admin.service-register'), params, { preserveState: true, replace: true });
    };

    const updateServiceType = (value: string) => {
        router.get(route('church-admin.service-register'), { month, service_type: value }, { preserveState: true, replace: true });
    };

    const markAttendance = (memberProfileId: number, date: string, status: string | null, selectedMonth: string, selectedServiceType: string, firstTimerState?: boolean) => {
        router.post(route('church-admin.service-register.attendance'), {
            member_profile_id: memberProfileId,
            service_type: selectedServiceType,
            month: selectedMonth,
            service_date: date,
            status,
            first_timer: firstTimerState ?? false,
        }, { preserveScroll: true });
    };

    const statusLabel = (status?: string | null) => status === 'present' ? 'P' : status === 'late' ? 'L' : status === 'absent' ? 'A' : status === 'excused' ? 'E' : '—';
    const statusClass = (status?: string | null) => status === 'present' ? 'bg-emerald-100 text-emerald-700' : status === 'late' ? 'bg-amber-100 text-amber-700' : status === 'absent' ? 'bg-rose-100 text-rose-700' : status === 'excused' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-400';
    const firstTimerClass = (isFirstTimer: boolean) => isFirstTimer ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-500 border border-slate-200';
    const primaryServiceLabel = serviceTypes.find((option) => option.value === serviceType)?.label ?? 'Main Service';

    const toggleFirstTimer = (memberProfileId: number, date: string, selectedMonth: string, selectedServiceType: string, currentStatus: string | null, currentValue: boolean) => {
        const nextStatus = currentStatus === 'present' || currentStatus === 'late' ? currentStatus : 'present';

        router.post(route('church-admin.service-register.attendance'), {
            member_profile_id: memberProfileId,
            service_type: selectedServiceType,
            month: selectedMonth,
            service_date: date,
            status: nextStatus,
            first_timer: !currentValue,
        }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Service Register - ${monthLabel}`} />
            <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Church administration</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">Monthly Service Register</h1>
                        <p className="mt-2 text-sm text-slate-600">Capture attendance for {primaryServiceLabel.toLowerCase()} and the rest of the church’s dynamic service calendar without manual data entry.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="text-sm font-semibold text-slate-700">Month<input type="month" value={month} onChange={(event) => updateMonth(event.target.value)} className="ml-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
                        <label className="text-sm font-semibold text-slate-700">Service<select value={serviceType} onChange={(event) => updateServiceType(event.target.value)} className="ml-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal">
                            {serviceTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select></label>
                    </div>
                </div>

                {flash?.success && <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{flash.success}</div>}

                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Register month</p><p className="mt-2 text-xl font-bold text-slate-900">{monthLabel}</p></div>
                    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active members</p><p className="mt-2 text-xl font-bold text-slate-900">{rows.length}</p></div>
                    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Service type</p><p className="mt-2 text-xl font-bold text-slate-900">{primaryServiceLabel}</p></div>
                    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Service dates</p><p className="mt-2 text-xl font-bold text-slate-900">{serviceDates.length}</p></div>
                </div>

                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600"><span className="font-semibold text-slate-700">Status:</span><span><b className="mr-1 rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">P</b> Present</span><span><b className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">L</b> Late</span><span><b className="mr-1 rounded bg-rose-100 px-1.5 py-0.5 text-rose-700">A</b> Absent</span><span><b className="mr-1 rounded bg-slate-200 px-1.5 py-0.5 text-slate-700">E</b> Excused</span></div>

                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                        <span className="font-medium">Search</span>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search member or code"
                            className="w-56 border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                        />
                    </label>
                </div>

                <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-[980px] w-full border-separate border-spacing-0 text-left">
                            <thead>
                                <tr className="bg-red-50">
                                    <th className="sticky left-0 z-10 border-b border-r border-red-100 bg-red-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Member</th>
                                    <th className="border-b border-r border-red-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">Referral code</th>
                                    {serviceDates.map((serviceDate, index) => (
                                        <th key={serviceDate} className="border-b border-red-100 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
                                            {serviceType === 'main_service' || serviceType === 'sunday_school' ? `Week ${index + 1}` : `Service ${index + 1}`}
                                            <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-slate-500">{new Date(`${serviceDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {visibleRows.length > 0 ? visibleRows.map((row) => <tr key={row.id} className="group hover:bg-red-50/40">
                                    <td className="sticky left-0 z-[1] border-b border-r border-red-50 bg-white px-4 py-3 text-sm font-semibold text-slate-800 group-hover:bg-red-50/40">{row.name}</td>
                                    <td className="border-b border-r border-red-50 px-4 py-3 font-mono text-xs text-slate-500">{row.referral_code || '—'}</td>
                                    {serviceDates.map((serviceDate, index) => {
                                        const week = row.weeks[index];
                                        return (
                                            <td key={`${row.id}-${serviceDate}`} className="border-b border-red-50 px-3 py-2 text-center">
                                                {week ? (
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button type="button" title="Present" onClick={() => markAttendance(row.id, serviceDate, 'present', month, serviceType, week.first_timer ?? false)} className={`h-8 w-8 rounded-lg text-xs font-bold ${week.status === 'present' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'}`}>P</button>
                                                            <button type="button" title="Late" onClick={() => markAttendance(row.id, serviceDate, 'late', month, serviceType, week.first_timer ?? false)} className={`h-8 w-8 rounded-lg text-xs font-bold ${week.status === 'late' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-700'}`}>L</button>
                                                            <button type="button" title="Absent" onClick={() => markAttendance(row.id, serviceDate, 'absent', month, serviceType, week.first_timer ?? false)} className={`h-8 w-8 rounded-lg text-xs font-bold ${week.status === 'absent' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-700'}`}>A</button>
                                                            <button type="button" title="Excused" onClick={() => markAttendance(row.id, serviceDate, 'excused', month, serviceType, week.first_timer ?? false)} className={`h-8 w-8 rounded-lg text-xs font-bold ${week.status === 'excused' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}>E</button>
                                                            <span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-1 text-xs font-bold ${statusClass(week.status)}`}>{statusLabel(week.status)}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleFirstTimer(row.id, serviceDate, month, serviceType, week.status ?? 'present', Boolean(week.first_timer ?? false))}
                                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition ${firstTimerClass(Boolean(week.first_timer ?? false))}`}
                                                            title={Boolean(week.first_timer ?? false) ? 'Mark as not first timer' : 'Mark as first timer'}
                                                        >
                                                            <span>FT</span>
                                                            {Boolean(week.first_timer ?? false) ? 'Yes' : 'No'}
                                                        </button>
                                                    </div>
                                                ) : <span className="text-xs text-slate-300">—</span>}
                                            </td>
                                        );
                                    })}
                                </tr>) : <tr><td colSpan={serviceDates.length + 2} className="px-6 py-12 text-center text-sm text-slate-500">{searchTerm ? 'No member matches your search in this register.' : 'No active members are available for this register.'}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
                <p className="mt-4 text-xs text-slate-500">Only active members appear in the register. Any member left unmarked is automatically recorded as absent for the selected service date and added to the absentee follow-up list.</p>
            </div>
        </AuthenticatedLayout>
    );
}
