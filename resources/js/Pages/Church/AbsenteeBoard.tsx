import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import jsPDF from 'jspdf';

interface AbsenteeRecord {
    id: number;
    member_name: string;
    reason?: string;
    service_type: string;
    service_date: string;
    status: string;
    photo_url?: string | null;
}

interface SavedWeek {
    start: string;
    label: string;
    records: number;
    excused: number;
}

export default function AbsenteeBoard({ absentees, flash, period = 'week', selectedDate, periodLabel, savedWeeks = [] }: { absentees: AbsenteeRecord[]; flash?: { success?: string }; period?: 'week' | 'month'; selectedDate: string; periodLabel: string; savedWeeks?: SavedWeek[] }) {
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

    const changeScope = (nextPeriod: 'week' | 'month', nextDate = selectedDate) => {
        const normalizedDate = nextPeriod === 'month' && nextDate.length === 7 ? `${nextDate}-01` : nextDate;
        router.get('/church-admin/absentees', { period: nextPeriod, date: normalizedDate }, { preserveState: true, replace: true });
    };

    const moveWeek = (offset: number) => {
        const date = new Date(`${selectedDate}T12:00:00`);
        date.setDate(date.getDate() + offset * 7);
        changeScope('week', date.toISOString().slice(0, 10));
    };

    const exportAbsenteeReport = () => {
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 40;
        const innerWidth = pageWidth - margin * 2;
        const serviceDate = absentees.length ? absentees[0].service_date : new Date().toISOString().slice(0, 10);
        const totalAbsent = absentees.length;
        const totalExcused = absentees.filter((entry) => entry.status === 'excused').length;

        const drawHeader = (pageNumber = 1) => {
            pdf.setFillColor(120, 16, 23);
            pdf.rect(0, 0, pageWidth, 58, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(20);
            pdf.text('APGA Worldwide', margin, 28);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.text('Church Leadership Absentee Report', margin, 46);

            pdf.setTextColor(210, 210, 210);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.text(`Page ${pageNumber}`, pageWidth - margin - 34, 48, { align: 'right' });
        };

        const drawFooter = (pageNumber: number) => {
            pdf.setDrawColor(210, 210, 210);
            pdf.line(margin, pageHeight - 44, pageWidth - margin, pageHeight - 44);
            pdf.setTextColor(100, 116, 139);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text('APGA Worldwide | Church Leadership and Stewardship', margin, pageHeight - 26);
            pdf.text(`Page ${pageNumber}`, pageWidth - margin - 34, pageHeight - 26, { align: 'right' });
        };

        const drawPageShell = (pageNumber: number) => {
            drawHeader(pageNumber);

            pdf.setTextColor(30, 41, 59);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(20);
            pdf.text('Absentee Follow-Up Report', margin, 96);

            pdf.setTextColor(75, 85, 99);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.text(`Generated records: ${totalAbsent}`, margin, 122);
            pdf.text(`Service visibility period: ${serviceDate}`, margin, 140);

            pdf.setFillColor(245, 247, 250);
            pdf.roundedRect(margin, 160, innerWidth, 82, 8, 8, 'F');
            pdf.setDrawColor(210, 216, 222);
            pdf.roundedRect(margin, 160, innerWidth, 82, 8, 8, 'S');

            pdf.setTextColor(30, 41, 59);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(13);
            pdf.text('Executive Summary', margin + 16, 184);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(75, 85, 99);
            pdf.text(`Total absentee records: ${totalAbsent}`, margin + 16, 204);
            pdf.text(`Excused records: ${totalExcused}`, margin + 16, 220);
            pdf.text(`Service date monitored: ${serviceDate}`, margin + 16, 238);

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);
            pdf.setFillColor(120, 16, 23);
            pdf.roundedRect(margin, 270 - 16, innerWidth, 24, 4, 4, 'F');
            pdf.text('MEMBER', margin + 12, 270);
            pdf.text('SERVICE', margin + 245, 270);
            pdf.text('DATE', margin + 380, 270);
            pdf.text('STATUS', margin + 470, 270);
        };

        const drawRow = (entry: AbsenteeRecord, rowY: number) => {
            const rowHeight = 34;
            const shortStatus = String(entry.status || 'absent').toLowerCase();
            const statusFill = shortStatus === 'excused' ? [251, 191, 36] : [185, 49, 63];
            const statusText = shortStatus === 'excused' ? 'excused' : 'absent';
            const statusX = margin + innerWidth - 76;
            const statusW = 58;

            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(margin, rowY - 15, innerWidth, rowHeight, 4, 4, 'F');
            pdf.setDrawColor(222, 226, 230);
            pdf.roundedRect(margin, rowY - 15, innerWidth, rowHeight, 4, 4, 'S');

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(30, 41, 59);
            pdf.text(entry.member_name, margin + 12, rowY + 3);
            pdf.text(entry.service_type.replace('_', ' '), margin + 245, rowY + 3);
            pdf.text(entry.service_date, margin + 380, rowY + 3);

            pdf.setFillColor(statusFill[0], statusFill[1], statusFill[2]);
            pdf.setTextColor(255, 255, 255);
            pdf.roundedRect(statusX, rowY - 10, statusW, 21, 4, 4, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.text(statusText, statusX + statusW / 2, rowY + 4, { align: 'center' });
        };

        let pageNumber = 1;
        let rowY = 270 + 24;

        drawPageShell(pageNumber);

        absentees.forEach((entry) => {
            if (rowY > pageHeight - 92) {
                drawFooter(pageNumber);
                pdf.addPage();
                pageNumber += 1;
                rowY = 270 + 24;
                drawPageShell(pageNumber);
            }

            drawRow(entry, rowY);
            rowY += 40;
        });

        drawFooter(pageNumber);
        pdf.save('absentee-report.pdf');
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
                    <p className="mt-2 text-sm text-slate-600">Review saved absentee records week by week or across a full month.</p>
                </div>

                <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
                    <label className="text-sm font-semibold text-slate-700">
                        View period
                        <select value={period} onChange={(event) => changeScope(event.target.value as 'week' | 'month')} className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                            <option value="week">Week by week</option>
                            <option value="month">Monthly view</option>
                        </select>
                    </label>
                    <label className="text-sm font-semibold text-slate-700">
                        {period === 'week' ? 'Any date in week' : 'Month'}
                        <input type={period === 'month' ? 'month' : 'date'} value={period === 'month' ? selectedDate.slice(0, 7) : selectedDate} onChange={(event) => changeScope(period, event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
                    </label>
                    {period === 'week' && (
                        <div className="flex gap-2">
                            <button type="button" onClick={() => moveWeek(-1)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700">← Previous week</button>
                            <button type="button" onClick={() => moveWeek(1)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700">Next week →</button>
                        </div>
                    )}
                    <div className="ml-auto rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">{periodLabel}</div>
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
                        <div className="flex items-center gap-3">
                            <p className="text-xs text-slate-400">Showing {displayAbsentees.length} records for {periodLabel}</p>
                            <button type="button" onClick={exportAbsenteeReport} className="rounded-xl bg-red-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300">
                                Report
                            </button>
                        </div>
                    </div>

                    {displayAbsentees.length > 0 ? (
                        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                            {displayAbsentees.map((entry, index) => (
                                <div key={entry.id} className="group relative min-h-[128px] overflow-hidden border border-white/10 bg-white/[0.05] p-3 transition hover:-translate-y-1 hover:border-red-300/60 hover:bg-white/[0.09]">
                                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_25%,rgba(248,113,113,0.5)_25%,rgba(248,113,113,0.5)_50%,transparent_50%,transparent_75%,rgba(248,113,113,0.5)_75%)] [background-size:8px_8px]" />
                                    <div className="relative z-10 flex h-full flex-col justify-between">
                                        <div className="flex items-start justify-between">
                                            {entry.photo_url ? (
                                                <img src={entry.photo_url} alt={entry.member_name} className="h-12 w-12 rounded-xl border border-white/20 bg-white object-cover shadow-[0_0_24px_rgba(248,113,113,0.16)]" />
                                            ) : (
                                                <div className="grid h-12 w-12 grid-cols-3 grid-rows-3 gap-0.5 rounded-xl bg-red-500/20 p-1 shadow-[0_0_24px_rgba(248,113,113,0.16)]">
                                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((pixel) => <span key={pixel} className={`rounded-sm ${pixel % 2 === index % 2 ? 'bg-red-300' : 'bg-red-900/70'}`} />)}
                                                </div>
                                            )}
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

                {period === 'week' && savedWeeks.length > 0 && (
                    <section className="mb-8 rounded-3xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Saved weekly history</p>
                                <h2 className="mt-2 text-xl font-bold text-slate-900">Jump to a recorded week</h2>
                            </div>
                            <span className="text-xs text-slate-500">{savedWeeks.length} saved week(s)</span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {savedWeeks.map((week) => (
                                <button key={week.start} type="button" onClick={() => changeScope('week', week.start)} className={`rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md ${week.start === selectedDate ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-200'}`}>
                                    <p className="text-sm font-bold text-slate-800">{week.label}</p>
                                    <p className="mt-2 text-xs text-slate-500">{week.records} absentee record(s) · {week.excused} excused</p>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

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
