import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface BirthdayEntry {
    id: number;
    name: string;
    date_of_birth: string;
    next_birthday: string;
    department?: string;
}

interface MemberLifecycle {
    total_active_members: number;
    total_first_timers: number;
    total_inactive_members: number;
    needs_follow_up: number;
}

interface FollowUpItem {
    id: number;
    name: string;
    reason: 'first_timer_follow_up' | 'inactive_member_follow_up';
    department: string;
    status: 'first_timer' | 'inactive';
}

interface ConversionSummary {
    total: number;
    validated: number;
    pending: number;
    rate: number;
}

interface CompletionSummary {
    total: number;
    completed: number;
    incomplete: number;
    rate: number;
}

interface EngagementTask {
    task_type: 'pending_referral_follow_up' | 'incomplete_onboarding' | 'inactive_member_recovery';
    priority: 'high' | 'medium' | 'low';
    priority_rank: number;
    name: string;
    details: string;
    updated_at: string;
}

interface ChurchData {
    totalMembers: number;
    totalUsers: number;
    attendanceToday: number;
    firstTimersToday: number;
    latestServiceDate?: string | null;
    serviceName: string;
    memberLifecycle?: MemberLifecycle;
    referralConversion?: ConversionSummary;
    onboardingCompletion?: CompletionSummary;
    engagementPipeline?: EngagementTask[];
    followUpQueue?: FollowUpItem[];
    upcomingBirthdays: BirthdayEntry[];
}

export default function AdminDashboard({ churchData }: { churchData: ChurchData }) {
    const lifecycle = churchData.memberLifecycle ?? {
        total_active_members: 0,
        total_first_timers: 0,
        total_inactive_members: 0,
        needs_follow_up: 0,
    };

    const referralConversion = churchData.referralConversion ?? {
        total: 0,
        validated: 0,
        pending: 0,
        rate: 0,
    };

    const onboardingCompletion = churchData.onboardingCompletion ?? {
        total: 0,
        completed: 0,
        incomplete: 0,
        rate: 0,
    };

    const latestServiceLabel = churchData.latestServiceDate ? `(${new Date(churchData.latestServiceDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })})` : '(no service captured)';

    const statCards = [
        { label: 'Total Members', value: churchData.totalMembers, tone: 'from-red-600 to-red-500', accent: 'text-red-600', glow: 'shadow-red-200/80' },
        { label: 'Active Users', value: churchData.totalUsers, tone: 'from-rose-600 to-pink-500', accent: 'text-rose-600', glow: 'shadow-rose-200/80' },
        { label: `Attendance ${latestServiceLabel}`, value: churchData.attendanceToday, tone: 'from-orange-500 to-amber-400', accent: 'text-orange-600', glow: 'shadow-orange-200/80' },
        { label: `First Timers ${latestServiceLabel}`, value: churchData.firstTimersToday, tone: 'from-red-700 to-rose-600', accent: 'text-red-700', glow: 'shadow-red-200/80' },
    ];

    const [animatedValues, setAnimatedValues] = useState<number[]>(statCards.map(() => 0));

    useEffect(() => {
        let frameId = 0;
        const start = performance.now();
        const duration = 700;

        const update = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            setAnimatedValues(statCards.map((card) => Math.round(card.value * eased)));

            if (progress < 1) {
                frameId = requestAnimationFrame(update);
            }
        };

        frameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(frameId);
    }, [churchData.totalMembers, churchData.totalUsers, churchData.attendanceToday, churchData.firstTimersToday]);

    const formatStatValue = (value: number) => new Intl.NumberFormat('en-US').format(value);

    const birthdayItems = churchData.upcomingBirthdays ?? [];
    const followUpItems = churchData.followUpQueue ?? [];
    const engagementPipeline = churchData.engagementPipeline ?? [];

    const quickActions = [
        { label: 'Service register', description: 'Track Sunday attendance', href: route('church-admin.service-register'), tone: 'from-red-600 to-rose-500' },
        { label: 'User management', description: 'Manage staff and admins', href: route('church-admin.users'), tone: 'from-slate-700 to-slate-500' },
        { label: 'Reports', description: 'Leadership analytics', href: route('church-admin.reports'), tone: 'from-orange-500 to-amber-400' },
        { label: 'Scorecards', description: 'Invitation and conversion stats', href: route('church-admin.scorecards'), tone: 'from-violet-600 to-indigo-500' },
        { label: 'Absentees', description: 'Follow-up and recovery', href: route('church-admin.absentees'), tone: 'from-slate-700 to-slate-500' },
        { label: 'Workers meeting', description: 'Team coordination', href: route('church-admin.workers-meetings'), tone: 'from-emerald-600 to-teal-500' },
        { label: 'Media board', description: 'Stories and interviews', href: route('church-admin.media'), tone: 'from-pink-600 to-rose-500' },
        { label: 'Announcements', description: 'Public church updates', href: route('church-admin.announcements'), tone: 'from-cyan-600 to-sky-500' },
        { label: 'Newsletter', description: 'Subscribers and campaigns', href: route('church-admin.newsletter-subscribers'), tone: 'from-fuchsia-600 to-purple-500' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Church Admin Dashboard" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 overflow-hidden rounded-[28px] border border-red-200 bg-gradient-to-r from-red-700 via-red-600 to-rose-700 p-6 text-white shadow-[0_30px_80px_rgba(153,27,27,0.28)]">
                    <div className="absolute inset-0" aria-hidden="true" />
                    <div className="relative">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-100">APGA Church Ops</p>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-red-50">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                                live overview
                            </span>
                        </div>
                        <h1 className="mt-4 text-3xl font-bold md:text-4xl">Church Administration Dashboard</h1>
                        <p className="mt-3 max-w-2xl text-red-50">{churchData.serviceName} overview and ministry operations</p>
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card, index) => (
                        <div key={card.label} className={`group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${card.glow}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-transparent opacity-80" />
                            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.tone}`} />
                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                                    <p className={`mt-4 text-3xl font-black tracking-tight ${card.accent} transition-all duration-500 group-hover:scale-[1.03]`}>{formatStatValue(animatedValues[index] ?? 0)}</p>
                                </div>
                                <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-lg font-bold text-white shadow-lg shadow-red-200/70 ring-4 ring-white/80 animate-pulse`}>
                                    {index + 1}
                                </div>
                            </div>
                            <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full bg-gradient-to-r ${card.tone} transition-all duration-500`} style={{ width: `${Math.min((Number(card.value) / Math.max(Number(card.value) + 12, 12)) * 100, 100)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 overflow-hidden rounded-[30px] border border-red-200 bg-gradient-to-br from-red-50 via-white to-amber-50 p-6 shadow-[0_18px_60px_rgba(153,27,27,0.08)]">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Sunday service</p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900">Take attendance</h2>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">Open the monthly service register and mark each member present or late as they arrive.</p>
                        </div>
                        <Link
                            href={route('church-admin.service-register')}
                            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-700 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-red-300"
                        >
                            Open attendance register
                            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Referral conversion', value: `${referralConversion.rate}%`, detail: `${referralConversion.validated}/${referralConversion.total} validated`, tone: 'from-rose-600 to-red-500' },
                        { label: 'Pending invites', value: `${referralConversion.pending}`, detail: 'Awaiting validation', tone: 'from-amber-500 to-orange-400' },
                        { label: 'Onboarding complete', value: `${onboardingCompletion.rate}%`, detail: `${onboardingCompletion.completed}/${onboardingCompletion.total} finished`, tone: 'from-emerald-500 to-teal-500' },
                        { label: 'Incomplete onboarding', value: `${onboardingCompletion.incomplete}`, detail: 'Follow-up required', tone: 'from-violet-600 to-indigo-500' },
                    ].map((item) => (
                        <div key={item.label} className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.tone}`} />
                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">{item.label}</p>
                            <p className="mt-4 text-3xl font-black text-slate-900">{item.value}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{item.detail}</p>
                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full bg-gradient-to-r ${item.tone} transition-all duration-500`} style={{ width: `${Math.min(Number.parseInt(item.value, 10) || 0, 100)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <div className="rounded-[28px] border border-red-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Operations</p>
                                <h2 className="mt-2 text-xl font-bold text-slate-900">Quick admin actions</h2>
                            </div>
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-700">Live</span>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50 p-4 transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
                                >
                                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${action.tone}`} />
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-base font-bold text-slate-900">{action.label}</p>
                                            <p className="mt-2 text-sm text-slate-600">{action.description}</p>
                                        </div>
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-700 shadow-sm transition group-hover:translate-x-0.5 group-hover:text-red-700">
                                            →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6 shadow-[0_18px_45px_rgba(217,119,6,0.08)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Member lifecycle</p>
                                <h2 className="mt-2 text-xl font-bold text-slate-900">Onboarding & follow-up</h2>
                            </div>
                            <div className="rounded-full border border-amber-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">{lifecycle.needs_follow_up} pending</div>
                        </div>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {[
                                { label: 'Active members', value: lifecycle.total_active_members, tone: 'from-emerald-500 to-teal-500' },
                                { label: 'First timers', value: lifecycle.total_first_timers, tone: 'from-red-500 to-rose-500' },
                                { label: 'Inactive', value: lifecycle.total_inactive_members, tone: 'from-slate-500 to-slate-700' },
                                { label: 'Needs follow-up', value: lifecycle.needs_follow_up, tone: 'from-amber-500 to-orange-500' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-2xl border border-amber-200 bg-white/80 p-3 shadow-sm">
                                    <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${item.tone}`} />
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-[28px] border border-red-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Engagement pipeline</p>
                                <h2 className="mt-2 text-xl font-bold text-slate-900">Outreach actions</h2>
                            </div>
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-700">{engagementPipeline.length}</span>
                        </div>
                        {engagementPipeline.length > 0 ? (
                            <ul className="mt-5 space-y-3 text-sm text-slate-600">
                                {engagementPipeline.map((task) => (
                                    <li key={`${task.task_type}-${task.name}`} className="rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3 shadow-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-800">{task.name}</p>
                                                <p className="text-xs text-slate-500">{task.details}</p>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${task.priority === 'high' ? 'bg-rose-100 text-rose-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-5 text-sm text-slate-500">No outreach tasks are currently waiting.</p>
                        )}
                    </div>

                    <div className="rounded-[28px] border border-red-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Follow-up queue</p>
                                <h2 className="mt-2 text-xl font-bold text-slate-900">Members to contact</h2>
                            </div>
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-700">{followUpItems.length}</span>
                        </div>
                        {followUpItems.length > 0 ? (
                            <ul className="mt-5 space-y-3 text-sm text-slate-600">
                                {followUpItems.map((member) => (
                                    <li key={member.id} className="rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3 shadow-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-800">{member.name}</p>
                                                <p className="text-xs text-slate-500">{member.department}</p>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${member.reason === 'first_timer_follow_up' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}`}>
                                                {member.reason === 'first_timer_follow_up' ? 'first timer' : 'inactive'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-5 text-sm text-slate-500">No members are currently waiting for follow-up.</p>
                        )}
                    </div>

                    <div className="rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6 shadow-[0_18px_45px_rgba(217,119,6,0.08)]">
                        <h2 className="text-xl font-bold text-slate-900">Upcoming Birthdays</h2>
                        {birthdayItems.length > 0 ? (
                            <ul className="mt-5 space-y-3 text-sm text-slate-600">
                                {birthdayItems.map((birthday) => (
                                    <li key={birthday.id} className="rounded-2xl border border-amber-200 bg-white/80 px-4 py-3 shadow-sm transition hover:-translate-y-0.5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-800">{birthday.name}</p>
                                                <p className="text-xs text-slate-500">{birthday.department ?? 'Member'}</p>
                                            </div>
                                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                {birthday.date_of_birth}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-5 text-sm text-slate-500">No member birthdays are currently scheduled.</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
