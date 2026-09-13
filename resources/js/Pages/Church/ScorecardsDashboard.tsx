import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import jsPDF from 'jspdf';

interface Scorecard {
    id: number;
    period_type: string;
    title: string;
    report_date: string;
    invitation_count: number;
    new_visitors_count: number;
    conversion_count: number;
    score: number;
    notes?: string;
}

interface ValidatedInvitationCount {
    inviter?: {
        id?: number;
        name?: string | null;
        referral_code?: string | null;
        memberProfile?: { id?: number; user_id?: number; avatar_path?: string | null } | null;
    } | null;
    avatar_url?: string | null;
    validated_count: number;
}

export default function ScorecardsDashboard({ scorecards, validatedInvitationCounts = [], flash }: { scorecards: Scorecard[]; validatedInvitationCounts?: ValidatedInvitationCount[]; flash?: { success?: string } }) {
    const exportInviterLeaderboardPdf = () => {
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 40;
        const topTwenty = [...validatedInvitationCounts]
            .filter((entry) => entry.validated_count > 0)
            .sort((a, b) => b.validated_count - a.validated_count)
            .slice(0, 20);

        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - 6);
        const startText = `${start.toISOString().slice(0, 10)}`;
        const endText = `${now.toISOString().slice(0, 10)}`;

        pdf.setFillColor(120, 16, 23);
        pdf.rect(0, 0, pageWidth, 58, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.text('APGA Worldwide', margin, 28);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text('Church Leadership Invitation Report', margin, 46);

        pdf.setTextColor(30, 41, 59);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.text('Weekly Top 20 Inviters', margin, 96);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text(`Week: ${startText} - ${endText}`, margin, 118);
        pdf.text(`Total listed: ${Math.min(topTwenty.length, 20)}`, margin, 136);

        pdf.setFillColor(245, 247, 250);
        pdf.roundedRect(margin, 150, pageWidth - margin * 2, 70, 8, 8, 'F');
        pdf.setDrawColor(210, 216, 222);
        pdf.roundedRect(margin, 150, pageWidth - margin * 2, 70, 8, 8, 'S');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(30, 41, 59);
        pdf.text('Executive Summary', margin + 16, 176);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        pdf.text(`Report scope: Top 20 validated church inviters`, margin + 16, 198);
        pdf.text(`Invited people counted: ${topTwenty.reduce((sum, item) => sum + item.validated_count, 0)}`, margin + 16, 214);

        let y = 260;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.setFillColor(120, 16, 23);
        pdf.roundedRect(margin, y - 16, pageWidth - margin * 2, 24, 4, 4, 'F');
        pdf.text('RANK', margin + 12, y);
        pdf.text('MEMBER', margin + 120, y);
        pdf.text('INVITED PEOPLE', margin + 380, y);

        y += 24;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);

        topTwenty.forEach((entry, index) => {
            if (y > pageHeight - 100) {
                pdf.addPage();
                y = 70;
                pdf.setFillColor(120, 16, 23);
                pdf.setTextColor(255, 255, 255);
                pdf.roundedRect(margin, y - 16, pageWidth - margin * 2, 24, 4, 4, 'F');
                pdf.text('RANK', margin + 12, y);
                pdf.text('MEMBER', margin + 120, y);
                pdf.text('INVITED PEOPLE', margin + 380, y);
                y += 24;
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(30, 41, 59);
            }

            pdf.setFillColor(250, 250, 250);
            pdf.roundedRect(margin, y - 16, pageWidth - margin * 2, 30, 4, 4, 'F');
            pdf.setDrawColor(222, 226, 230);
            pdf.roundedRect(margin, y - 16, pageWidth - margin * 2, 30, 4, 4, 'S');

            pdf.text(String(index + 1), margin + 12, y + 2);
            pdf.text(entry.inviter?.name || 'Member', margin + 120, y + 2);
            pdf.text(String(entry.validated_count), margin + 380, y + 2);
            y += 36;
        });

        pdf.setDrawColor(210, 210, 210);
        pdf.line(margin, pageHeight - 44, pageWidth - margin, pageHeight - 44);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text('APGA Worldwide | Church Leadership and Stewardship', margin, pageHeight - 26);

        pdf.save('apga-weekly-top-20-inviters.pdf');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Invitation League & Scorecards" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Scorecards</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">Invitation League & Church Scorecards</h1>
                    </div>
                    <button type="button" onClick={exportInviterLeaderboardPdf} className="rounded-xl bg-red-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300">
                        Report
                    </button>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="mb-8 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Validated invitation league</p><h2 className="mt-2 text-xl font-bold text-slate-900">Invitations confirmed by Sunday attendance</h2></div>
                        <p className="text-xs text-slate-500">Registration alone never counts.</p>
                    </div>
                    {validatedInvitationCounts.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{validatedInvitationCounts.map((entry, index) => (
                        <div key={`${entry.inviter?.name}-${index}`} className="rounded-2xl border border-red-100 bg-red-50 p-4">
                            <div className="flex items-center gap-3">
                                {entry.avatar_url ? (
                                    <img src={entry.avatar_url} alt={entry.inviter?.name || 'Member'} className="h-12 w-12 rounded-full object-cover border border-red-200 bg-white shadow-sm" />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-white text-xs font-bold text-red-700">
                                        {String(entry.inviter?.name || 'M').slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">#{index + 1}</p>
                                    <p className="mt-1 truncate font-semibold text-slate-900">{entry.inviter?.name || 'Member'}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{entry.validated_count}</p>
                            <p className="text-xs text-slate-500">validated invitations</p>
                        </div>
                    ))}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No validated invitations yet.</div>}
                </div>

                <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-red-100 text-left">
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Period</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Title</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Date</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Score</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Visitors</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-red-50 bg-white">
                            {scorecards.length > 0 ? scorecards.map((scorecard) => (
                                <tr key={scorecard.id} className="hover:bg-red-50/40">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800 capitalize">{scorecard.period_type}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{scorecard.title}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{scorecard.report_date}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{scorecard.score}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{scorecard.new_visitors_count}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No scorecards have been recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
