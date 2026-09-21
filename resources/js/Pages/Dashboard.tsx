import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    type: string;
    primary_role: string;
    sector: string;
    registrationStatus: string;
    isVerified: boolean;
    needsProfileCompletion: boolean;
    communityRank: number;
    activeRoles: string[];
    referral: {
        code: string;
        link: string;
        pending: number;
        validated: number;
        total: number;
    };
    wallet: {
        usdi: string;
        ind: string;
        ngn: string;
        ngni: string;
    };
}

interface DashboardContext {
    current_role: string;
    role_label: string;
    available_roles: string[];
    can_switch_roles: boolean;
    active_roles: string[];
    has_cpd_access: boolean;
}

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    permission: string;
    route: string;
}

interface UpcomingEvent {
    id: number;
    title: string;
    date: string;
    type: string;
    location?: string;
    is_registered: boolean;
    registration_deadline?: string;
}

interface DashboardProps {
    user: User;
    dashboardContext: DashboardContext;
    currentRole: string;
    roleLabel: string;
    stats: any;
    recentActivity: any[];
    upcomingEvents: UpcomingEvent[];
    trainingData: any;
    communityData: any;
    quickActions: QuickAction[];
    churchSummary?: {
        attendance_total?: number;
        prayer_requests?: number;
        active_ministries?: number;
        upcoming_events?: number;
    };
    churchHealth: {
        attendance: number;
        attendance_change: number | null;
        prayer_requests: number;
        new_visits: number;
        next_service: string | null;
        next_service_date: string | null;
    };
    churchGroups: SmallGroupCard[];
    recentChurchActivity: ChurchActivity[];
}

interface SmallGroupCard {
    id: number;
    name: string;
    members: string;
    time: string;
}

interface ChurchActivity {
    title: string;
    detail: string;
    time: string;
    status: string;
    action_url?: string;
    action_label?: string;
}

export default function Dashboard({
    user,
    quickActions,
    upcomingEvents,
    churchSummary,
    churchHealth,
    churchGroups,
    recentChurchActivity,
    trainingData,
    communityData,
}: DashboardProps) {
    const [activeSection, setActiveSection] = useState<'overview' | 'attendance' | 'events' | 'community'>('overview');
    const [copiedReferral, setCopiedReferral] = useState(false);

    const isAdminUser = Boolean(user?.email === 'crownpaysme19@gmail.com') || Boolean((user as any)?.is_admin) || Boolean((user as any)?.roles?.includes('admin')) || Boolean((user as any)?.roles?.includes('super-admin')) || Boolean((user as any)?.role === 'admin') || Boolean((user as any)?.primary_role === 'admin');

    const summaryCards = [
        {
            title: 'Attendance',
            value: (churchSummary?.attendance_total ?? 0).toLocaleString(),
            note: 'Recorded attendance entries',
            tone: 'from-red-500 to-red-600',
            route: null,
        },
        {
            title: 'Prayer Requests',
            value: (churchSummary?.prayer_requests ?? 0).toLocaleString(),
            note: 'Open prayer needs',
            tone: 'from-rose-500 to-orange-500',
            route: 'prayer-requests',
        },
        {
            title: 'Ministries',
            value: (churchSummary?.active_ministries ?? 0).toLocaleString(),
            note: 'Active fellowships',
            tone: 'from-amber-500 to-red-500',
            route: 'ministries',
        },
        {
            title: 'Events',
            value: (churchSummary?.upcoming_events ?? 0).toLocaleString().padStart(2, '0'),
            note: 'Scheduled this quarter',
            tone: 'from-red-600 to-red-800',
            route: 'events',
        },
    ];

    const actions = quickActions ?? [];
    const churchEvents = upcomingEvents?.slice(0, 3) ?? [];

    const navItems = [
        { id: 'overview', label: 'Overview' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'events', label: 'Events' },
        { id: 'community', label: 'Community' },
    ];

    const handleQuickAction = (action: QuickAction) => {
        if (action.route.startsWith('http://') || action.route.startsWith('https://')) {
            window.open(action.route, '_blank');
            return;
        }

        router.visit(route(action.route));
    };

    return (
        <AuthenticatedLayout>
            <Head title="APGA Worldwide Dashboard" />

            <div className="min-h-screen bg-[#f4f1ed] text-slate-800">
                <div className="mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-5 lg:px-8">
                    <div className="mb-3 overflow-hidden rounded-[24px] border border-slate-700 bg-slate-950 p-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">APGA Worldwide</p>
                                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Church Dashboard</h1>
                                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                                    Welcome back, {user.name}. Your ministry operations, attendance, prayer support, and member engagement are all in one place.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href={route('community')}
                                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                                >
                                    View Community
                                </Link>
                                <Link
                                    href={route('training.dashboard')}
                                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-red-50"
                                >
                                    Word Ministry
                                </Link>
                                {isAdminUser && (
                                    <Link
                                        href={route('church-admin.index')}
                                        className="rounded-full border border-red-300 bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-500"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setActiveSection(item.id as typeof activeSection);
                                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                aria-current={activeSection === item.id ? 'page' : undefined}
                                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                                    activeSection === item.id
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-red-50 hover:text-red-700'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div id="overview" className="grid grid-cols-2 scroll-mt-36 gap-2 md:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map((card) => (
                            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                                <div className={`mb-2 h-1.5 rounded-full bg-gradient-to-r ${card.tone}`} />
                                <p className="text-xs font-medium text-slate-500">{card.title}</p>
                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <span className="text-2xl font-bold text-slate-900">{card.value}</span>
                                    {card.route && (
                                        <Link
                                            href={route(card.route)}
                                            aria-label={`Open ${card.title}`}
                                            title={`Open ${card.title}`}
                                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                        </Link>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-slate-500">{card.note}</p>
                            </div>
                        ))}
                    </div>

                    <section className="mt-3 h-fit rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-[0.30em] text-red-600">Invitation league</p>
                                <h2 className="mt-1 text-lg font-bold text-slate-900">Invite someone to APGA</h2>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600">An invitation counts only after registration through your link and qualifying Sunday attendance.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-center">
                                <span className="min-w-[74px]">
                                    <strong className="block text-xl font-bold text-slate-900">{user.referral?.total ?? 0}</strong>
                                    <span className="block text-xs text-slate-500">Total invited</span>
                                </span>
                                <span className="min-w-[74px]">
                                    <strong className="block text-xl font-bold text-slate-900">{user.referral?.validated ?? 0}</strong>
                                    <span className="block text-xs text-slate-500">Validated</span>
                                </span>
                                <span className="min-w-[74px]">
                                    <strong className="block text-xl font-bold text-slate-900">{user.referral?.pending ?? 0}</strong>
                                    <span className="block text-xs text-slate-500">Pending</span>
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <input readOnly value={user.referral?.link ?? ''} aria-label="Referral link" className="min-w-[290px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600" />
                            <button type="button" onClick={async () => { await navigator.clipboard.writeText(user.referral.link); setCopiedReferral(true); window.setTimeout(() => setCopiedReferral(false), 1800); }} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500">{copiedReferral ? 'Copied' : 'Copy referral link'}</button>
                        </div>

                        <p className="mt-3 text-xs text-slate-500">Referral code: <span className="font-semibold tracking-wider text-slate-700">{user.referral?.code}</span></p>
                    </section>

                    <div className="mt-3 grid grid-cols-1 items-start gap-2 md:grid-cols-12">
                        <Link href={route('training.dashboard')} className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:border-red-300 hover:bg-red-50 md:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Learning</p>
                            <h2 className="mt-2 text-lg font-bold text-slate-900">Training progress</h2>
                            <p className="mt-3 text-sm text-slate-600">{trainingData?.stats?.total_enrolled ?? 0} enrolled, {trainingData?.stats?.in_progress ?? 0} in progress, {trainingData?.stats?.completed ?? 0} completed</p>
                        </Link>
                        <Link href={route('community.index')} className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:border-red-300 hover:bg-red-50 md:col-span-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Community</p>
                            <h2 className="mt-2 text-lg font-bold text-slate-900">Your community activity</h2>
                            <p className="mt-3 text-sm text-slate-600">{communityData?.community_stats?.total_communities ?? 0} communities, {communityData?.community_stats?.total_posts ?? 0} posts, {communityData?.community_stats?.mentorship_sessions ?? 0} mentorship sessions</p>
                        </Link>
                    </div>

                    <div id="attendance" className="mt-3 grid items-start scroll-mt-36 gap-2">
                        <div className="h-fit rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Overview</p>
                                    <h2 className="mt-1 text-lg font-bold text-slate-900">Church health at a glance</h2>
                                </div>
                            </div>

                            <div className="grid gap-2 md:grid-cols-2">
                                <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
                                    <div className="flex items-center justify-between text-sm text-red-700">
                                        <span className="font-semibold">Attendance</span>
                                        <span>{churchHealth.attendance_change === null ? 'No prior data' : `${churchHealth.attendance_change >= 0 ? '+' : ''}${churchHealth.attendance_change}% vs last week`}</span>
                                    </div>
                                    <div className="mt-4 text-3xl font-bold text-slate-900">{churchHealth.attendance.toLocaleString()}</div>
                                    <p className="mt-2 text-sm text-slate-600">Members present in worship</p>
                                </div>

                                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
                                    <div className="flex items-center justify-between text-sm text-amber-700">
                                        <span className="font-semibold">Prayer coverage</span>
                                        <span>Live</span>
                                    </div>
                                    <div className="mt-4 text-3xl font-bold text-slate-900">{churchHealth.prayer_requests.toLocaleString()}</div>
                                    <p className="mt-2 text-sm text-slate-600">Prayer requests being supported</p>
                                </div>

                                <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
                                    <div className="flex items-center justify-between text-sm text-red-700">
                                        <span className="font-semibold">New visits</span>
                                        <span>This month</span>
                                    </div>
                                    <div className="mt-4 text-3xl font-bold text-slate-900">{churchHealth.new_visits.toLocaleString()}</div>
                                    <p className="mt-2 text-sm text-slate-600">Visitors connected to the church</p>
                                </div>

                                <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
                                    <div className="flex items-center justify-between text-sm text-red-700">
                                        <span className="font-semibold">Service plan</span>
                                        <span>{churchHealth.next_service_date ?? 'To be announced'}</span>
                                    </div>
                                    <div className="mt-4 text-xl font-bold text-slate-900">{churchHealth.next_service ?? 'No upcoming service scheduled'}</div>
                                    <p className="mt-2 text-sm text-slate-600">Next scheduled church activity</p>
                                </div>
                            </div>
                        </div>

                        {churchEvents.length > 0 && <div className="h-fit self-start rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Calendar</p>
                                    <h2 className="mt-1 text-lg font-bold text-slate-900">Upcoming events</h2>
                                </div>
                                <Link href={route('events')} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-700 transition hover:bg-red-100">
                                    View all
                                </Link>
                            </div>
                            <div className="mt-3 space-y-2">
                                {churchEvents.map((event) => (
                                    <Link key={event.id} href={route('events.detail', event.id)} className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-red-200 hover:bg-red-50">
                                        <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
                                        <p className="mt-1 text-xs text-slate-600">{event.date}{event.location ? ` · ${event.location}` : ''}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>}

                    </div>

                    <div id="events" className="mt-3 grid items-start scroll-mt-36 gap-2 md:grid-cols-2 xl:grid-cols-3">
                        <section className="h-fit self-start rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:shadow-md">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-600">Actions</p>
                                    <h2 className="mt-2 text-lg font-bold text-slate-900">Quick tools</h2>
                                </div>
                                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-700">Tools</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {actions.slice(0, 6).map((action) => (
                                    <button
                                        key={action.id}
                                        type="button"
                                        onClick={() => handleQuickAction(action)}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-left transition hover:border-red-200 hover:bg-red-50 hover:shadow-sm"
                                    >
                                        <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm text-white ${action.color}`}>{action.icon}</div>
                                        <p className="truncate font-semibold text-[11px] text-slate-900">{action.title}</p>
                                        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-600">{action.description}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {churchGroups.length > 0 && <section className="h-fit self-start rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:shadow-md">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-600">Community</p>
                                    <h2 className="mt-2 text-lg font-bold text-slate-900">Small groups</h2>
                                </div>
                                <Link href={route('small-groups')} className="rounded-full border border-red-200 px-3 py-1.5 text-[10px] font-bold text-red-700 transition hover:bg-red-50">
                                    View groups
                                </Link>
                            </div>

                            <div className="space-y-2">
                                {churchGroups.slice(0, 3).map((group) => (
                                    <div key={group.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-sm font-semibold text-slate-900">{group.name}</p>
                                            <span className="rounded-full bg-red-100 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-red-700">Active</span>
                                        </div>
                                        <p className="mt-1 text-[11px] text-slate-600">{group.members}</p>
                                    </div>
                                ))}
                            </div>
                        </section>}

                        <section className="h-fit self-start rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:shadow-md">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-600">Latest</p>
                                    <h2 className="mt-2 text-lg font-bold text-slate-900">Recent activity</h2>
                                </div>
                                <Link href={route('dashboard')} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-700 transition hover:bg-red-100">
                                    Refresh
                                </Link>
                            </div>

                            <div className="space-y-2">
                                {recentChurchActivity.length > 0 ? recentChurchActivity.slice(0, 3).map((item) => (
                                    <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                                            <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                                                item.status === 'success'
                                                    ? 'bg-red-100 text-red-700'
                                                    : item.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-red-100 text-red-700'
                                            }`}>{item.status}</span>
                                        </div>
                                        <p className="mt-1 text-[11px] text-slate-600">{item.detail}</p>
                                        <p className="mt-1 text-[10px] text-slate-500">{item.time}</p>
                                    </div>
                                )) : <p className="rounded-xl bg-red-50 p-3 text-sm text-slate-600">No recent church activity recorded yet.</p>}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
