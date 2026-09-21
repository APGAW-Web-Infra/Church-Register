import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import jsPDF from 'jspdf';

interface Report {
    id: number;
    period_type: string;
    title: string;
    report_date: string;
    summary?: string;
    attendance_count: number;
    first_timers_count: number;
    new_members_count: number;
    prayer_requests_count: number;
    is_live?: boolean;
}

interface ReportAnalytics {
    totalAttendance: number;
    totalFirstTimers: number;
    totalNewMembers: number;
    totalPrayerRequests: number;
    averageAttendance: number;
    latestReport?: Report;
    weeklyReports: number;
    monthlyReports: number;
    quarterlyReports: number;
    annualReports: number;
    attendanceTrend: string;
    weeklyGrowth: string;
    attendanceSeries: { id: number; label: string; period: string; value: number; width: number }[];
    strongestPeriod: string;
    leadershipHeadline: string;
    leadershipNarrative: string;
    leadershipSummary: string;
    leadershipInsight: string;
    totalInvitations: number;
    totalVisitors: number;
    totalConversions: number;
    conversionRate: string;
    scoreTrend: string;
    attendanceComparison: string;
    invitationComparison: string;
    newMembersTrend: string;
    firstTimerTrend: string;
    prayerMomentum: string;
    engagementRate: string;
    liveAttendance: {
        total: number;
        present: number;
        late: number;
        byService: Record<string, number>;
        trend: { label: string; value: number }[];
        trendLabel: string;
        trendDescription: string;
    };
}

export default function ReportsDashboard({
    reports,
    liveReport,
    flash,
    analyticsLabels,
    periodType = 'all',
    analytics: serverAnalytics,
}: {
    reports: Report[];
    liveReport?: Report | null;
    flash?: { success?: string };
    periodType?: string;
    analyticsLabels?: {
        attendanceTrend?: string;
        weeklyGrowth?: string;
        strongestPeriod?: string;
    };
    analytics?: Partial<ReportAnalytics>;
}) {
    const getLocalAnalytics = () => {
        const totalAttendance = reports.reduce((sum, report) => sum + Number(report.attendance_count ?? 0), 0);
        const totalFirstTimers = reports.reduce((sum, report) => sum + Number(report.first_timers_count ?? 0), 0);
        const totalNewMembers = reports.reduce((sum, report) => sum + Number(report.new_members_count ?? 0), 0);
        const totalPrayerRequests = reports.reduce((sum, report) => sum + Number(report.prayer_requests_count ?? 0), 0);
        const averageAttendance = reports.length ? Math.round(totalAttendance / reports.length) : 0;
        const latestReport = reports[0];
        const weeklyReports = reports.filter((report) => report.period_type === 'weekly');
        const monthlyReports = reports.filter((report) => report.period_type === 'monthly');
        const quarterlyReports = reports.filter((report) => report.period_type === 'quarterly');
        const annualReports = reports.filter((report) => report.period_type === 'annual');

        const sortedReports = [...reports].sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime());
        const attendanceTrendValue = sortedReports.length > 1
            ? Number(sortedReports[sortedReports.length - 1].attendance_count ?? 0) - Number(sortedReports[0].attendance_count ?? 0)
            : Number(sortedReports[0]?.attendance_count ?? 0);
        const growthReports = weeklyReports.length > 1 ? weeklyReports : sortedReports;
        const previousAttendance = growthReports.length > 1 ? Number(growthReports[growthReports.length - 2].attendance_count ?? 0) : Number(growthReports[0]?.attendance_count ?? 0);
        const latestAttendance = Number(growthReports[growthReports.length - 1]?.attendance_count ?? 0);
        const weeklyGrowth = previousAttendance > 0 ? Math.round(((latestAttendance - previousAttendance) / previousAttendance) * 100) : 0;
        const maxAttendance = Math.max(...sortedReports.map((report) => Number(report.attendance_count ?? 0)), 0);
        const attendanceSeries = sortedReports.map((report) => ({
            id: report.id,
            label: new Date(report.report_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            period: report.period_type,
            value: Number(report.attendance_count ?? 0),
            width: maxAttendance ? Math.max((Number(report.attendance_count ?? 0) / maxAttendance) * 100, 4) : 4,
        }));
        const strongestPeriod = reports.reduce<Record<string, number>>((acc, report) => {
            acc[report.period_type] = (acc[report.period_type] ?? 0) + Number(report.attendance_count ?? 0);
            return acc;
        }, {});
        const strongestPeriodLabel = Object.entries(strongestPeriod).sort((a, b) => b[1] - a[1])[0];
        const leadershipHeadline = latestReport
            ? `Leadership brief: ${latestReport.title}`
            : 'Leadership brief: Awaiting first report';
        const leadershipNarrative = strongestPeriodLabel
            ? `The strongest reporting period is ${strongestPeriodLabel[0]} with ${strongestPeriodLabel[1]} recorded attendees. This cycle reflects ${totalAttendance} total attendance and ${totalFirstTimers} first-timer touchpoints.`
            : 'No attendance trend data yet. Add a report to publish the leadership briefing.';

        return {
            totalAttendance,
            totalFirstTimers,
            totalNewMembers,
            totalPrayerRequests,
            averageAttendance,
            latestReport,
            weeklyReports: weeklyReports.length,
            monthlyReports: monthlyReports.length,
            quarterlyReports: quarterlyReports.length,
            annualReports: annualReports.length,
            attendanceTrend: attendanceTrendValue >= 0 ? `+${attendanceTrendValue}` : `${attendanceTrendValue}`,
            weeklyGrowth: `${weeklyGrowth >= 0 ? '+' : ''}${weeklyGrowth}%`,
            attendanceSeries,
            strongestPeriod: strongestPeriodLabel ? `${strongestPeriodLabel[0].toUpperCase()}${strongestPeriodLabel[0].slice(1)} (${strongestPeriodLabel[1]})` : 'No data',
            leadershipHeadline,
            leadershipNarrative,
            leadershipSummary: latestReport
                ? `Latest church pulse: ${latestReport.title} (${latestReport.report_date}) - attendance ${latestReport.attendance_count}, first timers ${latestReport.first_timers_count}, prayer requests ${latestReport.prayer_requests_count}.`
                : 'No church reports are available yet.',
            leadershipInsight: strongestPeriodLabel
                ? `The strongest reporting period is ${strongestPeriodLabel[0]} with ${strongestPeriodLabel[1]} recorded attendees.`
                : 'No attendance trend data yet.',
        };
    };

    const localAnalytics = getLocalAnalytics();
    const liveTrend = serverAnalytics?.liveAttendance?.trend ?? [];
    const liveTrendMaximum = Math.max(...liveTrend.map((point) => point.value), 0);
    const hasReportedAttendance = reports.some((report) => Number(report.attendance_count ?? 0) > 0);
    const liveAttendanceTotal = serverAnalytics?.liveAttendance?.total ?? 0;
    const liveFirstTimers = serverAnalytics?.totalFirstTimers ?? 0;
    const fallbackLeadershipHeadline = liveAttendanceTotal > 0
        ? 'Leadership brief: Live attendance summary'
        : 'Leadership brief: Awaiting first report';
    const fallbackLeadershipNarrative = liveAttendanceTotal > 0
        ? `The live church ledger is reporting ${liveAttendanceTotal} qualifying attendance records and ${liveFirstTimers} first-timer touchpoints. This summary reflects current service activity until formal reports are posted.`
        : 'No attendance trend data yet. Add a report to publish the leadership briefing.';
    const analytics = {
        ...localAnalytics,
        ...(serverAnalytics ?? {}),
        leadershipHeadline: hasReportedAttendance ? localAnalytics.leadershipHeadline : fallbackLeadershipHeadline,
        leadershipNarrative: hasReportedAttendance ? localAnalytics.leadershipNarrative : fallbackLeadershipNarrative,
        attendanceSeries: hasReportedAttendance
            ? localAnalytics.attendanceSeries
            : liveTrend.map((point, index) => ({
                id: index,
                label: point.label,
                period: periodType,
                value: point.value,
                width: liveTrendMaximum ? Math.max((point.value / liveTrendMaximum) * 100, point.value ? 4 : 0) : 0,
            })),
    };

    const exportLeadershipBriefPdf = () => {
        const brief = new jsPDF({ unit: 'pt', format: 'a4' });
        const briefWidth = brief.internal.pageSize.getWidth();
        const briefHeight = brief.internal.pageSize.getHeight();
        const briefScope = periodType === 'all' ? 'All report periods' : `${periodType.charAt(0).toUpperCase()}${periodType.slice(1)} report`;

        brief.setFillColor(11, 18, 32);
        brief.rect(0, 0, briefWidth, 120, 'F');
        brief.setTextColor(255, 255, 255);
        brief.setFont('helvetica', 'bold');
        brief.setFontSize(22);
        brief.text('APGA Worldwide', 42, 34);
        brief.setFont('helvetica', 'normal');
        brief.setFontSize(11);
        brief.text('Leadership Brief', 42, 56);
        brief.setTextColor(211, 219, 227);
        brief.text(`${briefScope} • ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`, 42, 76);

        const metricCards = [
            ['Attendance', analytics.totalAttendance],
            ['First timers', analytics.totalFirstTimers],
            ['New members', analytics.totalNewMembers],
            ['Prayer requests', analytics.totalPrayerRequests],
        ];

        let cardX = 42;
        let cardY = 138;
        metricCards.forEach(([label, value]) => {
            brief.setFillColor(248, 250, 252);
            brief.roundedRect(cardX, cardY, 118, 64, 12, 12, 'F');
            brief.setDrawColor(226, 232, 240);
            brief.roundedRect(cardX, cardY, 118, 64, 12, 12, 'S');
            brief.setTextColor(100, 116, 139);
            brief.setFont('helvetica', 'normal');
            brief.setFontSize(8);
            brief.text(String(label).toUpperCase(), cardX + 12, cardY + 20);
            brief.setTextColor(15, 23, 42);
            brief.setFont('helvetica', 'bold');
            brief.setFontSize(18);
            brief.text(String(value), cardX + 12, cardY + 42);
            cardX += 132;
        });

        brief.setTextColor(15, 23, 42);
        brief.setFont('helvetica', 'bold');
        brief.setFontSize(13);
        brief.text('Executive summary', 42, 236);
        brief.setFont('helvetica', 'normal');
        brief.setFontSize(11);
        const executiveSummary = brief.splitTextToSize(analytics.leadershipSummary || 'No report summary available yet.', 500);
        brief.text(executiveSummary, 42, 252);

        brief.setFont('helvetica', 'bold');
        brief.setFontSize(12);
        brief.text('Leadership insight', 42, 330);
        brief.setFont('helvetica', 'normal');
        const insightLines = brief.splitTextToSize(analytics.leadershipInsight || 'No insight available yet.', 500);
        brief.text(insightLines, 42, 346);

        brief.setFillColor(245, 247, 250);
        brief.roundedRect(42, 382, briefWidth - 84, 122, 12, 12, 'F');
        brief.setDrawColor(226, 232, 240);
        brief.roundedRect(42, 382, briefWidth - 84, 122, 12, 12, 'S');
        brief.setFont('helvetica', 'bold');
        brief.setFontSize(12);
        brief.text('Report detail highlights', 58, 408);
        brief.setFont('helvetica', 'normal');
        brief.setFontSize(10);

        const detailRows = (reports.length > 0 ? reports : (liveReport ? [liveReport] : [])).slice(0, 4);
        detailRows.forEach((report, index) => {
            const summaryLine = `${report.title} • ${report.period_type.toUpperCase()} • ${report.report_date}`;
            const lines = brief.splitTextToSize(summaryLine, 420);
            brief.text(lines, 58, 428 + (index * 24));
            brief.text(`Attendance ${report.attendance_count} • First timers ${report.first_timers_count} • Prayer requests ${report.prayer_requests_count}`, 58, 440 + (index * 24));
        });

        brief.setDrawColor(218, 221, 226);
        brief.line(42, briefHeight - 38, briefWidth - 42, briefHeight - 38);
        brief.setTextColor(100, 116, 139);
        brief.setFont('helvetica', 'normal');
        brief.setFontSize(9);
        brief.text('APGA Worldwide | Church Leadership and Stewardship', 42, briefHeight - 22);
        brief.text(`Generated ${new Date().toLocaleString()}`, briefWidth - 120, briefHeight - 22, { align: 'right' });

        brief.save('apga-worldwide-leadership-brief.pdf');
    };

    const exportReportsPdf = () => {
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const scopeLabel = periodType === 'all' ? 'All periods' : `${periodType.charAt(0).toUpperCase()}${periodType.slice(1)}`;

        const drawHeader = (includeSubtitle = true) => {
            pdf.setFillColor(120, 16, 23);
            pdf.rect(0, 0, pageWidth, 62, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(20);
            pdf.text('APGA Worldwide', 40, 28);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.text('Church Leadership Report', 40, 46);
            if (includeSubtitle) {
                pdf.setTextColor(240, 240, 240);
                pdf.text(scopeLabel, pageWidth - 110, 46, { align: 'right' });
            }
        };

        const drawFooter = (page: number, totalPages: number) => {
            pdf.setPage(page);
            pdf.setDrawColor(226, 232, 240);
            pdf.line(40, pageHeight - 42, pageWidth - 40, pageHeight - 42);
            pdf.setTextColor(100, 116, 139);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text('APGA Worldwide | Church Leadership and Stewardship', 40, pageHeight - 25);
            pdf.text(`Page ${page} of ${totalPages}`, pageWidth - 100, pageHeight - 25);
        };

        const summaryStats = [
            ['Total attendance', analytics.totalAttendance],
            ['First timers', analytics.totalFirstTimers],
            ['New members', analytics.totalNewMembers],
            ['Prayer requests', analytics.totalPrayerRequests],
            ['Average attendance', analytics.averageAttendance],
            ['Attendance trend', analytics.attendanceTrend],
            ['Weekly growth', analytics.weeklyGrowth],
            ['Strongest period', analytics.strongestPeriod],
        ];

        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(11);
        drawHeader();

        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(40, 84, pageWidth - 80, 110, 12, 12, 'F');
        pdf.setDrawColor(225, 229, 234);
        pdf.roundedRect(40, 84, pageWidth - 80, 110, 12, 12, 'S');
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text('Executive Summary', 58, 108);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        const summaryText = pdf.splitTextToSize(analytics.leadershipSummary || 'No report summary available yet.', 430);
        pdf.text(summaryText, 58, 130);

        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Key metrics', 58, 208);

        let metricX = 58;
        let metricY = 224;
        summaryStats.forEach(([label, value]) => {
            const labelText = String(label);
            const valueText = String(value);
            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(metricX, metricY, 120, 40, 8, 8, 'F');
            pdf.setDrawColor(228, 232, 240);
            pdf.roundedRect(metricX, metricY, 120, 40, 8, 8, 'S');
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.text(labelText.toUpperCase(), metricX + 10, metricY + 15);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.setTextColor(15, 23, 42);
            pdf.text(valueText, metricX + 10, metricY + 30);
            metricX += 132;
            if (metricX > pageWidth - 210) {
                metricX = 58;
                metricY += 54;
            }
        });

        let y = metricY + 70;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Leadership insight', 40, y);
        y += 16;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        const insightText = pdf.splitTextToSize(analytics.leadershipInsight || 'No insight available yet.', 500);
        insightText.forEach((line: string) => {
            if (y > 760) {
                pdf.addPage();
                drawHeader(false);
                y = 60;
            }
            pdf.text(line, 40, y);
            y += 16;
        });

        y += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Report detail', 40, y);
        y += 18;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        reports.forEach((report, index) => {
            if (y > 720) {
                pdf.addPage();
                drawHeader(false);
                y = 60;
            }

            pdf.setFillColor(249, 250, 251);
            pdf.roundedRect(40, y - 12, pageWidth - 80, 66, 10, 10, 'F');
            pdf.setDrawColor(226, 232, 240);
            pdf.roundedRect(40, y - 12, pageWidth - 80, 66, 10, 10, 'S');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text(`${index + 1}. ${report.title}`, 54, y + 6);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text(`${report.period_type.toUpperCase()} • ${report.report_date}`, 54, y + 22);
            pdf.text(`Attendance: ${report.attendance_count}`, 54, y + 36);
            pdf.text(`First timers: ${report.first_timers_count}`, 190, y + 36);
            pdf.text(`New members: ${report.new_members_count}`, 310, y + 36);
            pdf.text(`Prayer requests: ${report.prayer_requests_count}`, 440, y + 36);
            if (report.summary) {
                const detailLines = pdf.splitTextToSize(report.summary, 500);
                detailLines.slice(0, 2).forEach((line: string) => {
                    pdf.text(line, 54, y + 50);
                    y += 10;
                });
            }
            y += 80;
        });

        const totalPages = pdf.getNumberOfPages();
        for (let page = 1; page <= totalPages; page += 1) {
            drawFooter(page, totalPages);
        }

        pdf.save('apga-worldwide-church-report.pdf');
    };

    const tableReports = reports.length > 0 ? reports : (liveReport ? [liveReport] : []);

    return (
        <AuthenticatedLayout>
            <Head title="Church Reports" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Reports</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">Church Report Center</h1>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="mb-6 flex justify-end">
                    <label className="mr-auto text-sm font-medium text-slate-700">
                        Report scope
                        <select
                            value={periodType}
                            onChange={(event) => router.get('/church-admin/reports', { period_type: event.target.value }, { preserveState: true, replace: true })}
                            className="ml-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                        >
                            <option value="all">All periods</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annual">Annual</option>
                        </select>
                    </label>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={exportLeadershipBriefPdf}
                            className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                        >
                            Export Brief PDF
                        </button>
                        <button
                            type="button"
                            onClick={exportReportsPdf}
                            className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
                        >
                            Export Leadership PDF
                        </button>
                    </div>
                </div>

                <div className="mb-6 rounded-3xl border border-red-200 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 p-5 text-white shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-red-200">Leadership brief</p>
                            <h2 className="mt-2 text-2xl font-bold">{analytics.leadershipHeadline}</h2>
                        </div>
                        <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-red-100">
                            {periodType === 'all' ? 'All report periods' : `${periodType.charAt(0).toUpperCase()}${periodType.slice(1)} focus`}
                        </div>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200">{analytics.leadershipNarrative}</p>
                </div>

                <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total attendance</p>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{analytics.totalAttendance}</p>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">First timers</p>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{analytics.totalFirstTimers}</p>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">New members</p>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{analytics.totalNewMembers}</p>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Avg. attendance</p>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{analytics.averageAttendance}</p>
                    </div>
                </div>

                <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Period comparison</p>
                            <h2 className="mt-2 text-xl font-bold text-slate-900">Latest report against the previous report</h2>
                        </div>
                        <p className="text-xs text-slate-500">{periodType === 'all' ? 'Across all report periods' : `Within ${periodType} reports`}</p>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl bg-white p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Attendance change</p><p className="mt-2 text-2xl font-bold text-slate-900">{analytics.attendanceComparison}</p></div>
                        <div className="rounded-2xl bg-white p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Invitation change</p><p className="mt-2 text-2xl font-bold text-slate-900">{analytics.invitationComparison}</p></div>
                        <div className="rounded-2xl bg-white p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Conversion rate</p><p className="mt-2 text-2xl font-bold text-slate-900">{analytics.conversionRate}</p></div>
                        <div className="rounded-2xl bg-white p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Score movement</p><p className="mt-2 text-2xl font-bold text-slate-900">{analytics.scoreTrend}</p></div>
                    </div>
                </div>

                <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[26px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700">New members</p>
                        <p className="mt-3 text-3xl font-black text-slate-900">{analytics.newMembersTrend}</p>
                        <p className="mt-2 text-xs text-emerald-800">movement this cycle</p>
                    </div>
                    <div className="rounded-[26px] border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-700">First timers</p>
                        <p className="mt-3 text-3xl font-black text-slate-900">{analytics.firstTimerTrend}</p>
                        <p className="mt-2 text-xs text-sky-800">new guest response</p>
                    </div>
                    <div className="rounded-[26px] border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-700">Prayer momentum</p>
                        <p className="mt-3 text-3xl font-black text-slate-900">{analytics.prayerMomentum}</p>
                        <p className="mt-2 text-xs text-violet-800">care requests rising</p>
                    </div>
                    <div className="rounded-[26px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">Engagement rate</p>
                        <p className="mt-3 text-3xl font-black text-slate-900">{analytics.engagementRate}</p>
                        <p className="mt-2 text-xs text-amber-800">first-timer share</p>
                    </div>
                </div>

                <section className="mb-8 overflow-hidden rounded-3xl border border-red-100 bg-slate-950 p-5 text-white shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">Live attendance ledger</p>
                            <h2 className="mt-2 text-xl font-bold">What has actually been recorded</h2>
                        </div>
                        <p className="text-xs text-slate-400">Present and late records across all services</p>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {[
                            ['All qualifying', analytics.liveAttendance?.total ?? 0],
                            ['Present', analytics.liveAttendance?.present ?? 0],
                            ['Late', analytics.liveAttendance?.late ?? 0],
                            ['Main service', analytics.liveAttendance?.byService?.main_service ?? 0],
                            ['Sunday School', analytics.liveAttendance?.byService?.sunday_school ?? 0],
                            ['Prayer meeting', analytics.liveAttendance?.byService?.prayer_meeting ?? 0],
                        ].map(([label, value]) => (
                            <div key={label} className="border border-white/10 bg-white/[0.06] p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                                <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-8 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Live attendance movement</p>
                            <h2 className="mt-2 text-xl font-bold text-slate-900">{analytics.liveAttendance?.trendLabel ?? 'Service rhythm'}</h2>
                        </div>
                        <p className="text-sm text-slate-500">{analytics.liveAttendance?.trendDescription ?? 'Raw present and late attendance records'}</p>
                    </div>
                    <div className={`mt-6 grid gap-3 ${periodType === 'annual' ? 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12' : 'grid-cols-4 sm:grid-cols-8'}`}>
                        {(analytics.liveAttendance?.trend ?? []).map((period) => {
                            const max = Math.max(...(analytics.liveAttendance?.trend ?? []).map((item) => item.value), 1);
                            const height = Math.max((period.value / max) * 100, period.value ? 10 : 3);

                            return (
                                <div key={period.label} className="group flex min-w-0 flex-col items-center gap-2">
                                    <div className="flex h-36 w-full items-end justify-center rounded-xl bg-slate-50 p-2">
                                        <div className="w-full rounded-lg bg-gradient-to-t from-red-700 to-orange-400 transition-all duration-500 group-hover:from-red-500 group-hover:to-amber-300" style={{ height: `${height}%` }} title={`${period.value} qualifying records`} />
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-500">{period.label}</span>
                                    <span className="text-xs font-bold text-slate-800">{period.value}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Invitations</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.totalInvitations}</p>
                    </div>
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">New visitors</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.totalVisitors}</p>
                    </div>
                    <div className="rounded-2xl border border-lime-100 bg-lime-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-700">Conversions</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.totalConversions}</p>
                    </div>
                    <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-700">Conversion rate</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.conversionRate}</p>
                        <p className="mt-2 text-xs text-fuchsia-800">Score trend: {analytics.scoreTrend}</p>
                    </div>
                </div>

                <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{analyticsLabels?.attendanceTrend ?? 'Attendance trend'}</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.attendanceTrend}</p>
                        <p className="mt-2 text-xs text-amber-800">vs earliest report</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{analyticsLabels?.weeklyGrowth ?? 'Weekly growth'}</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.weeklyGrowth}</p>
                        <p className="mt-2 text-xs text-emerald-800">recent trend</p>
                    </div>
                    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Prayer requests</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.totalPrayerRequests}</p>
                    </div>
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">{analyticsLabels?.strongestPeriod ?? 'Strongest period'}</p>
                        <p className="mt-3 text-sm font-bold text-slate-900">{analytics.strongestPeriod}</p>
                    </div>
                </div>

                <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Weekly reports</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.weeklyReports}</p>
                    </div>
                    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Monthly reports</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.monthlyReports}</p>
                    </div>
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Quarterly reports</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.quarterlyReports}</p>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Annual reports</p>
                        <p className="mt-3 text-2xl font-bold text-slate-900">{analytics.annualReports}</p>
                    </div>
                </div>

                {analytics.latestReport && (
                    <div className="mb-8 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Leadership summary</p>
                            <p className="mt-3 font-medium">{analytics.leadershipSummary}</p>
                        </div>
                        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Insight</p>
                            <p className="mt-3 font-medium">{analytics.leadershipInsight}</p>
                        </div>
                    </div>
                )}

                <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Attendance movement</p>
                            <h2 className="mt-2 text-xl font-bold text-slate-900">Reported attendance by period</h2>
                        </div>
                        <p className="text-sm text-slate-500">Oldest to latest report</p>
                    </div>

                    {analytics.attendanceSeries.length ? (
                        <div className="mt-6 space-y-4">
                            {analytics.attendanceSeries.map((point) => (
                                <div key={point.id} className="grid grid-cols-[76px_1fr_44px] items-center gap-3 text-sm">
                                    <div className="text-slate-500">
                                        <div className="font-medium text-slate-700">{point.label}</div>
                                        <div className="text-xs capitalize">{point.period}</div>
                                    </div>
                                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-400" style={{ width: `${point.width}%` }} />
                                    </div>
                                    <div className="text-right font-semibold text-slate-900">{point.value}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-6 text-sm text-slate-500">Attendance trends will appear after the first church report is recorded.</p>
                    )}
                </section>

                <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-red-100 text-left">
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Period</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Title</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Date</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Attendance</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">First Timers</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-red-50 bg-white">
                            {tableReports.length > 0 ? tableReports.map((report) => (
                                <tr key={report.id} className="hover:bg-red-50/40">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800 capitalize">{report.period_type}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {report.title}
                                        {report.is_live && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Live</span>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{report.report_date}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{report.attendance_count}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{report.first_timers_count}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No church reports have been created yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
