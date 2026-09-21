import { logo } from '@/images';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    churchSummary,
    flash,
}: PageProps<{
    laravelVersion: string;
    phpVersion: string;
    churchSummary?: {
        member_count?: number;
        attendance_total?: number;
        prayer_requests?: number;
        active_ministries?: number;
        upcoming_events?: number;
    };
    flash?: {
        newsletter_success?: string;
    };
}>) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const newsletterForm = useForm({ email: '' });
    const submitNewsletter = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        newsletterForm.post(route('newsletter.subscribe'), { onSuccess: () => newsletterForm.reset() });
    };
    const [highlightFooter, setHighlightFooter] = useState(false);
    const highlightTimeoutRef = useRef<number | null>(null);

    const memberCount = churchSummary?.member_count ?? 0;
    const sundayAttendance = churchSummary?.attendance_total ?? 0;
    const upcomingEventsCount = churchSummary?.upcoming_events ?? 0;
    const smallGroupsCount = churchSummary?.active_ministries ?? 0;
    const statTargets = [memberCount, sundayAttendance, upcomingEventsCount, smallGroupsCount];
    const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            setAnimatedStats(statTargets);
            return;
        }

        const start = performance.now();
        const duration = 1400;
        let frameId = 0;
        const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedStats(statTargets.map((target) => Math.round(target * eased)));

            if (progress < 1) {
                frameId = requestAnimationFrame(animate);
            }
        };

        frameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameId);
    }, [memberCount, sundayAttendance, upcomingEventsCount, smallGroupsCount]);

    const scrollToFooter = () => {
        const footer = document.getElementById('footer-resources');
        if (footer) {
            footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setHighlightFooter(true);
            if (highlightTimeoutRef.current) {
                window.clearTimeout(highlightTimeoutRef.current);
            }
            highlightTimeoutRef.current = window.setTimeout(() => {
                setHighlightFooter(false);
                highlightTimeoutRef.current = null;
            }, 2200);
        }
    };

    useEffect(() => {
        return () => {
            if (highlightTimeoutRef.current) {
                window.clearTimeout(highlightTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <Head title="APGA Worldwide - Apostolic Power Glorious Assembly" />
            <div className="bg-gradient-to-b from-slate-950 via-red-900/10 to-slate-950 text-slate-100 min-h-screen transition-colors duration-300">
                {/* Header */}
                <header className="relative z-50 bg-slate-950/95 backdrop-blur-sm border-b border-red-800/70">
                    <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 text-center justify-center">
                                <img src={logo} className="h-10 mx-auto" />
                            </div>
                            <span className="text-xl font-bold text-white">APGA Worldwide</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
                                    </svg>
                                )}
                            </button>

                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Join Us
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero Section */}
                <section className="apga-hero relative min-h-[640px] overflow-hidden bg-[#080711] text-white md:min-h-[680px]">
                    <style>{`
                        @keyframes apga-hero-enter { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
                        @keyframes apga-hero-drift { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(16px, -12px, 0); } }
                        @keyframes apga-hero-line { from { transform: translateX(-120%); } to { transform: translateX(120%); } }
                        .apga-hero-enter { animation: apga-hero-enter 900ms cubic-bezier(.22,1,.36,1) both; }
                        .apga-hero-delay-1 { animation-delay: 120ms; }
                        .apga-hero-delay-2 { animation-delay: 240ms; }
                        .apga-hero-delay-3 { animation-delay: 360ms; }
                        .apga-hero-drift { animation: apga-hero-drift 8s ease-in-out infinite; }
                        .apga-hero-line { animation: apga-hero-line 6s ease-in-out infinite; }
                        @media (prefers-reduced-motion: reduce) { .apga-hero-enter, .apga-hero-drift, .apga-hero-line { animation: none; } }
                    `}</style>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_35%,rgba(190,24,93,0.3),transparent_36%),radial-gradient(ellipse_at_85%_65%,rgba(220,38,38,0.22),transparent_34%),linear-gradient(120deg,#080711_0%,#100c1d_52%,#090812_100%)]" />
                    <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />
                    <div className="apga-hero-drift absolute -right-24 top-24 h-96 w-96 rounded-full border border-red-400/20 md:h-[30rem] md:w-[30rem]" />
                    <div className="apga-hero-drift absolute -right-8 top-40 h-64 w-64 rounded-full border border-red-300/10" style={{ animationDelay: '-2s' }} />
                    <div className="absolute bottom-0 left-0 h-px w-full overflow-hidden bg-white/10"><div className="apga-hero-line h-full w-1/3 bg-gradient-to-r from-transparent via-red-400 to-transparent" /></div>

                    <div className="relative z-10 mx-auto flex min-h-[640px] max-w-7xl items-center px-6 py-20 md:min-h-[680px] md:px-10">
                        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="max-w-3xl">
                                <div className="apga-hero-enter inline-flex items-center gap-3 border-l-2 border-red-400 pl-4 text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
                                    <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.9)]" />
                                    Apostolic Power Glorious Assembly Worldwide
                                </div>
                                <h1 className="apga-hero-enter apga-hero-delay-1 mt-7 text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">
                                    Growing God's
                                    <span className="block bg-gradient-to-r from-white via-red-200 to-red-500 bg-clip-text text-transparent">Kingdom together.</span>
                                </h1>
                                <p className="apga-hero-enter apga-hero-delay-2 mt-8 max-w-xl text-base leading-7 text-slate-300 md:text-lg">A living church community for spiritual growth, meaningful fellowship, and a faith that moves beyond Sunday.</p>
                                <div className="apga-hero-enter apga-hero-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Link href={route('register')} className="group inline-flex items-center justify-center gap-3 rounded-full bg-red-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_36px_rgba(239,68,68,0.25)] transition hover:-translate-y-1 hover:bg-red-400">
                                        Join the movement <span className="transition-transform group-hover:translate-x-1">→</span>
                                    </Link>
                                    <button type="button" onClick={scrollToFooter} className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-red-300/70 hover:bg-white/5">Explore APGA</button>
                                </div>
                            </div>

                            <div className="apga-hero-enter apga-hero-delay-2 relative hidden min-h-[330px] lg:block">
                                <div className="absolute right-8 top-0 h-72 w-72 rounded-full border border-red-300/20" />
                                <div className="absolute right-20 top-12 h-48 w-48 rounded-full border border-dashed border-red-300/25" />
                                <div className="absolute right-[8.5rem] top-[10.5rem] h-3 w-3 rounded-full bg-red-300 shadow-[0_0_28px_8px_rgba(248,113,113,0.35)]" />
                                <div className="absolute bottom-3 left-0 border-l border-red-300/50 pl-5 text-sm text-slate-400">
                                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-red-300">Community signal</p>
                                    <p className="mt-3 max-w-[210px] leading-6">Faith, people, and purpose moving in the same direction.</p>
                                </div>
                                <div className="absolute right-0 top-12 w-40 border-t border-white/15 pt-3 text-right text-[10px] uppercase tracking-[0.25em] text-slate-500">Est.  Worldwide<br /><span className="text-red-300">Together in faith</span></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="apga-pulse relative overflow-hidden bg-[#050816] py-20 text-white md:py-28">
                    <style>{`
                        @keyframes apga-pulse-rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
                        @keyframes apga-pulse-sheen { from { transform: translateX(-120%); } to { transform: translateX(420%); } }
                        @keyframes apga-pulse-scan { from { transform: translateX(-100%); } to { transform: translateX(100vw); } }
                        .apga-pulse-card { animation: apga-pulse-rise 800ms cubic-bezier(.22,1,.36,1) both; }
                        .apga-pulse-card:nth-child(2) { animation-delay: 120ms; }
                        .apga-pulse-card:nth-child(3) { animation-delay: 240ms; }
                        .apga-pulse-card:nth-child(4) { animation-delay: 360ms; }
                        .apga-pulse-card:hover .apga-pulse-sheen { animation: apga-pulse-sheen 900ms ease-out; }
                        .apga-pulse-scan { animation: apga-pulse-scan 7s ease-in-out infinite; }
                        @media (prefers-reduced-motion: reduce) {
                            .apga-pulse-card, .apga-pulse-scan { animation: none; }
                        }
                    `}</style>
                    <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:64px_64px]" />
                    <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
                    <div className="apga-pulse-scan absolute left-0 top-1/2 h-px w-1/3 bg-gradient-to-r from-transparent via-red-300 to-transparent blur-[1px]" />

                    <div className="relative z-10 mx-auto max-w-7xl px-6">
                        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-xl">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-red-300">APGA in motion</p>
                                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">The pulse of our church.</h2>
                            </div>
                            <p className="max-w-xs text-sm leading-6 text-slate-400">A live glimpse of the people, gatherings, and moments shaping this week.</p>
                        </div>

                        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: 'Total Members', value: animatedStats[0], index: '01', accent: 'from-red-300 to-rose-600', detail: 'People in the family' },
                                { label: 'This Month Attendance', value: animatedStats[1], index: '02', accent: 'from-orange-200 to-red-500', detail: 'Unique members at worship' },
                                { label: 'Upcoming Events', value: animatedStats[2], index: '03', accent: 'from-fuchsia-200 to-red-500', detail: 'Moments on the calendar' },
                                { label: 'Small Groups', value: animatedStats[3], index: '04', accent: 'from-amber-200 to-orange-500', detail: 'Circles growing together' },
                            ].map((stat) => (
                                <div key={stat.label} className="apga-pulse-card group relative min-h-[230px] overflow-hidden bg-[#0b1022] p-6 transition-colors duration-500 hover:bg-[#111832] md:p-8">
                                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accent}`} />
                                    <div className="apga-pulse-sheen absolute -left-1/2 top-0 h-full w-1/4 -skew-x-12 bg-white/10 opacity-0" />
                                    <div className="flex items-start justify-between">
                                        <span className="font-mono text-xs tracking-[0.3em] text-slate-500">{stat.index}</span>
                                        <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.9)] transition-transform duration-500 group-hover:scale-150" />
                                    </div>
                                    <div className="mt-12 flex items-end gap-2">
                                        <span className="text-5xl font-semibold tracking-tight text-white md:text-6xl">{stat.value.toLocaleString()}</span>
                                        <span className="mb-2 text-red-300">+</span>
                                    </div>
                                    <p className="mt-4 text-sm font-semibold text-slate-200">{stat.label}</p>
                                    <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
                                    <div className="absolute bottom-0 left-0 h-px w-0 bg-red-400 transition-all duration-500 group-hover:w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Church service schedule */}
                <section className="apga-week relative overflow-hidden bg-[#10090b] py-20 text-white md:py-28">
                    <style>{`
                        @keyframes apga-week-flow { from { transform: translateX(-100%); } to { transform: translateX(340%); } }
                        @keyframes apga-week-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                        .apga-week-flow { animation: apga-week-flow 8s linear infinite; }
                        .apga-week-item { animation: apga-week-rise 700ms cubic-bezier(.22,1,.36,1) both; }
                        .apga-week-item:nth-child(2) { animation-delay: 100ms; }
                        .apga-week-item:nth-child(3) { animation-delay: 200ms; }
                        .apga-week-item:nth-child(4) { animation-delay: 300ms; }
                        .apga-week-item:nth-child(5) { animation-delay: 400ms; }
                        @media (prefers-reduced-motion: reduce) { .apga-week-flow, .apga-week-item { animation: none; } }
                    `}</style>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(190,24,93,0.2),transparent_42%),linear-gradient(120deg,#10090b,#1d0b10_52%,#0d0a12)]" />
                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:58px_58px]" />
                    <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-red-300">Weekly rhythm</p>
                                <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-6xl">A week with purpose.</h2>
                            </div>
                            <p className="max-w-sm border-l border-red-400/50 pl-5 text-sm leading-6 text-slate-400">From worship to prayer, every gathering is another way to find your people and deepen your faith.</p>
                        </div>

                        <div className="relative">
                            <div className="absolute left-[8%] right-[8%] top-5 hidden h-px overflow-hidden bg-red-900/80 xl:block"><div className="apga-week-flow h-full w-1/4 bg-gradient-to-r from-transparent via-red-300 to-transparent" /></div>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                {[
                                    { day: 'SUN', title: 'Sunday Worship', time: 'Weekly', detail: 'Main Sanctuary · Family worship service', tone: 'from-red-500 to-rose-700', featured: true },
                                    { day: 'MON', title: 'Monday Program', time: 'Occasional special program', detail: 'Special church gathering & fellowship', tone: 'from-orange-400 to-amber-600' },
                                    { day: 'TUE', title: 'Tuesday Meeting', time: 'First & last Tuesday', detail: 'Monthly leadership and community rhythm', tone: 'from-fuchsia-400 to-rose-600' },
                                    { day: 'WED', title: 'Wednesday Prayer', time: 'Weekly', detail: 'Prayer & deliverance meeting', tone: 'from-red-500 to-orange-500' },
                                    { day: 'FRI', title: 'Friday Fellowship', time: 'First & last Friday', detail: 'Youth & teens discipleship and fellowship', tone: 'from-rose-500 to-red-700' },
                                ].map((service, index) => (
                                    <div key={service.title} className={`apga-week-item group relative overflow-hidden border border-red-900/70 bg-[#15101a]/90 p-5 transition duration-500 hover:-translate-y-2 hover:border-red-400/70 hover:bg-[#1b1320] ${service.featured ? 'min-h-[290px] md:col-span-2 xl:col-span-1 xl:-mt-5 xl:min-h-[330px] xl:p-7' : 'min-h-[250px]'}`}>
                                        <div className="flex items-center justify-between">
                                            <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${service.tone} text-[10px] font-black tracking-[0.18em] text-white shadow-lg shadow-red-950/30`}>{service.day}</span>
                                            <span className="font-mono text-xs text-red-300/70">0{index + 1}</span>
                                        </div>
                                        <div className={`mt-8 h-1 w-16 bg-gradient-to-r ${service.tone} transition-all duration-500 group-hover:w-28`} />
                                        <h3 className={`mt-5 font-semibold leading-tight text-white ${service.featured ? 'text-3xl' : 'text-2xl'}`}>{service.title}</h3>
                                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-red-200">{service.time}</p>
                                        <p className="mt-3 text-sm leading-6 text-slate-400">{service.detail}</p>
                                        {service.featured && <span className="absolute bottom-5 right-5 text-3xl text-red-400/30 transition duration-500 group-hover:translate-x-1 group-hover:text-red-300/70">↗</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ministries section */}
                <section className="apga-ministries relative overflow-hidden bg-[#070914] py-20 text-white md:py-28">
                    <style>{`
                        @keyframes apga-ministry-rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
                        @keyframes apga-ministry-orbit { from { transform: rotate(0deg) translateX(8px) rotate(0deg); } to { transform: rotate(360deg) translateX(8px) rotate(-360deg); } }
                        .apga-ministry-card { animation: apga-ministry-rise 700ms cubic-bezier(.22,1,.36,1) both; }
                        .apga-ministry-card:nth-child(2) { animation-delay: 120ms; }
                        .apga-ministry-card:nth-child(3) { animation-delay: 240ms; }
                        .apga-ministry-card:nth-child(4) { animation-delay: 360ms; }
                        .apga-ministry-orbit { animation: apga-ministry-orbit 12s linear infinite; }
                        @media (prefers-reduced-motion: reduce) { .apga-ministry-card, .apga-ministry-orbit { animation: none; } }
                    `}</style>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_80%,rgba(220,38,38,0.16),transparent_28%),radial-gradient(circle_at_90%_15%,rgba(190,24,93,0.14),transparent_30%),linear-gradient(135deg,#070914,#0d1020_55%,#100a12)]" />
                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:64px_64px]" />
                    <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8">
                        <div className="grid items-end gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                            <div className="relative">
                                <div className="apga-ministry-orbit absolute -left-8 -top-16 hidden h-44 w-44 rounded-full border border-red-400/20 lg:block" />
                                <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-red-300">Ministries</p>
                                <h2 className="mt-5 max-w-lg text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">Find your place to grow.</h2>
                                <p className="mt-6 max-w-md text-sm leading-7 text-slate-400 md:text-base">There is room for your story, your gifts, and your next faithful step. Discover a community built around becoming and belonging.</p>
                                <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                                    <Link href={route('ministries')} className="group inline-flex items-center gap-3 rounded-full bg-red-500 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-red-400">Explore ministries <span className="transition-transform group-hover:translate-x-1">→</span></Link>
                                    <Link href={route('units')} className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-300/70 hover:bg-white/5">Church units</Link>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    { name: 'Children’s Church', text: 'Nurturing the next generation with discipleship, creativity, and biblical teaching.', code: '01', accent: 'from-red-400 to-rose-600', tag: 'Next generation' },
                                    { name: 'Youth Ministry', text: 'Empowering teenagers and young adults through mentorship, music, and purpose-driven community.', code: '02', accent: 'from-orange-300 to-red-500', tag: 'Purpose & energy' },
                                    { name: 'Women’s Fellowship', text: 'Building spiritual strength, prayer support, and sisterhood across every season of life.', code: '03', accent: 'from-fuchsia-300 to-rose-600', tag: 'Strength together' },
                                    { name: 'Men’s Forum', text: 'Developing godly leadership, accountability, and service in the home and church.', code: '04', accent: 'from-amber-200 to-orange-500', tag: 'Lead & serve' },
                                ].map((ministry) => (
                                    <div key={ministry.name} className="apga-ministry-card group relative min-h-[210px] overflow-hidden border border-white/10 bg-white/[0.045] p-6 backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:border-red-300/50 hover:bg-white/[0.08]">
                                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ministry.accent}`} />
                                        <div className="flex items-start justify-between">
                                            <span className="font-mono text-xs tracking-[0.3em] text-slate-500">{ministry.code}</span>
                                            <span className="text-xs text-red-300 opacity-0 transition duration-500 group-hover:opacity-100">Explore ↗</span>
                                        </div>
                                        <div className={`mt-8 h-1 w-12 bg-gradient-to-r ${ministry.accent} transition-all duration-500 group-hover:w-24`} />
                                        <h3 className="mt-5 text-xl font-semibold text-white">{ministry.name}</h3>
                                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-200/80">{ministry.tag}</p>
                                        <p className="mt-3 text-sm leading-6 text-slate-400">{ministry.text}</p>
                                        <div className="absolute bottom-0 left-0 h-px w-0 bg-red-400 transition-all duration-500 group-hover:w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* President Section */}
                <section className="relative py-24 overflow-hidden bg-slate-950">
                    {/* Premium gradient background */}
                    <div className="absolute inset-0 bg-slate-950"></div>

                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-red-900/10 animate-pulse"></div>

                    {/* Decorative blurred shapes */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-200 dark:bg-red-700 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-red-200 dark:bg-red-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-10 dark:opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>

                    <div className="relative max-w-6xl mx-auto px-6 z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Content */}
                            <div>
                                <div className="inline-block mb-4">
                                    <span className="text-slate-100 font-semibold tracking-wider uppercase text-sm bg-red-800/70 px-4 py-2 border border-red-700 rounded-full backdrop-blur-sm">
                                        Leadership
                                    </span>
                                </div>
                                <h2 className="text-4xl font-bold mb-6 text-white">From Our President</h2>
                                <div className="space-y-4">
                                    <p className="text-slate-300 text-lg leading-relaxed">
                                        Welcome to APGA Worldwide, a community built on faith, purpose, and spiritual transformation. Our mission is to create an environment where every believer can grow in their relationship with God, connect meaningfully with their spiritual family, and make a positive impact on the world around them.
                                    </p>
                                    <p className="text-slate-300 text-lg leading-relaxed">
                                        Whether you're seeking spiritual guidance, looking to serve in ministry, or simply wanting to deepen your faith journey, you'll find a welcoming community here. We believe in the power of unity, fellowship, and the transformative power of God's Word.
                                    </p>
                                    <p className="text-red-300 text-lg font-semibold italic">
                                        "Come to me, all you who are weary and burdened, and I will give you rest." - Matthew 11:28
                                    </p>
                                </div>
                                <div className="mt-8">
                                    <Link
                                        href={route('register')}
                                        className="inline-block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
                                    >
                                        Join Our Community
                                    </Link>
                                </div>
                            </div>

                            {/* Image / Visual */}
                            <div className="relative">
                                <div className="p-8">
                                    <div className="text-center space-y-4">
                                        <img
                                            src="/images/President_GO.jpeg"
                                            alt="Prophet (Dr.) Samuel Olugbenga Ilesanmi"
                                            className="mx-auto h-64 w-64 rounded-2xl border-4 border-red-500 object-contain shadow-lg shadow-red-950/30"
                                        />
                                        <h3 className="text-2xl font-bold text-white">Prophet (Dr.) Samuel Olugbenga Ilesanmi</h3>
                                        <p className="text-red-300 font-semibold">President &amp; General Overseer, APGAW</p>
                                        <div className="pt-4 border-t border-red-800/50">
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                Leading with vision, integrity, and a heart for God's kingdom. Our leadership is committed to fostering spiritual growth and community transformation through faith and service.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Vice-President Welcome */}
                <section className="relative overflow-hidden bg-[#050816] py-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,_rgba(239,68,68,0.16),_transparent_28%),radial-gradient(circle_at_15%_80%,_rgba(14,165,233,0.12),_transparent_25%)]"></div>
                    <div className="relative z-10 mx-auto max-w-6xl px-6">
                        <div className="max-w-3xl border-l-2 border-red-500/70 pl-6 md:pl-8">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-300">Pastoral welcome</p>
                            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">A Word from the Vice-President</h2>
                            <p className="mt-6 text-lg leading-relaxed text-slate-300">
                                We welcome you into a fellowship where faith is strengthened, gifts are stewarded, and every believer is encouraged to serve God and His people with humility and excellence.
                            </p>
                            <p className="mt-4 text-lg leading-relaxed text-slate-300">
                                May your walk with Christ find encouragement through worship, prayer, sound teaching, and meaningful fellowship across the APGA Worldwide family.
                            </p>
                            <div className="mt-6 space-y-2 text-sm text-red-200">
                                <p><span className="font-semibold">Evangelist (Mrs.) Esther Omobolanriwa Ilesanmi</span> &mdash; Vice-President, APGAW</p>
                                <p><span className="font-semibold">Pastor Michael Olanrewaju</span> &mdash; Senior Pastor, Church Administration</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative overflow-hidden bg-[#050816] py-28">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.18),_transparent_22%),radial-gradient(circle_at_15%_80%,_rgba(239,68,68,0.18),_transparent_24%),radial-gradient(circle_at_85%_15%,_rgba(59,130,246,0.18),_transparent_22%)]"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,8,22,0.96),rgba(2,6,23,0.98))]"></div>

                    <div className="absolute left-8 top-16 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl"></div>
                    <div className="absolute right-12 top-20 h-80 w-80 rounded-full bg-red-500/15 blur-3xl"></div>
                    <div className="absolute bottom-6 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>

                    <div className="relative z-10 mx-auto max-w-7xl px-6">
                        <div className="mx-auto mb-14 max-w-4xl text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.38em] text-red-100 backdrop-blur-sm shadow-[0_0_24px_rgba(239,68,68,0.12)]">
                                <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]"></span>
                                Our platform
                            </div>
                            <h2 className="mb-5 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl lg:text-[5rem]">
                                Built for a church
                                <span className="block bg-gradient-to-r from-[#f8d9d9] via-[#f4a7a7] to-[#f7c778] bg-clip-text text-transparent">
                                    that moves with purpose
                                </span>
                            </h2>
                            <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-300 md:text-xl">
                                From worship and discipleship to outreach and growth, every feature is designed to help your community thrive in faith and momentum.
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {[
                                {
                                    title: "Worship & Prayer",
                                    href: route('prayer-requests'),
                                    description: "Create a vibrant rhythm of worship, prayer, and spiritual growth every week.",
                                    icon: "✝️",
                                    accent: "from-[#c74d68]/30 via-[#7f1d1d]/10 to-transparent",
                                    border: "border-red-400/20",
                                    glow: "shadow-[0_22px_60px_rgba(190,24,93,0.14)]"
                                },
                                {
                                    title: "Family & Discipleship",
                                    href: route('small-groups'),
                                    description: "Encourage meaningful discipleship with mentoring, teaching, and life-group connection.",
                                    icon: "🤝",
                                    accent: "from-[#f59e0b]/25 via-[#9333ea]/10 to-transparent",
                                    border: "border-orange-300/20",
                                    glow: "shadow-[0_22px_60px_rgba(249,115,22,0.12)]"
                                },
                                {
                                    title: "Events & Outreach",
                                    href: route('events'),
                                    description: "Plan memorable gatherings, serve the city, and launch powerful ministry moments.",
                                    icon: "📅",
                                    accent: "from-[#60a5fa]/25 via-[#3b82f6]/10 to-transparent",
                                    border: "border-blue-300/20",
                                    glow: "shadow-[0_22px_60px_rgba(59,130,246,0.12)]"
                                },
                                {
                                    title: "Member Care",
                                    href: route('contact'),
                                    description: "Keep every member supported through pastoral presence, prayer, and belonging.",
                                    icon: "👥",
                                    accent: "from-[#a78bfa]/25 via-[#8b5cf6]/10 to-transparent",
                                    border: "border-violet-300/20",
                                    glow: "shadow-[0_22px_60px_rgba(168,85,247,0.12)]",
                                    offset: "lg:translate-y-8"
                                },
                                {
                                    title: "Prayer Requests",
                                    href: route('prayer-requests'),
                                    description: "Lift every need before God and surround people with care, hope, and support.",
                                    icon: "🙏",
                                    accent: "from-[#f472b6]/25 via-[#ec4899]/10 to-transparent",
                                    border: "border-pink-300/20",
                                    glow: "shadow-[0_22px_60px_rgba(236,72,153,0.12)]",
                                    offset: "lg:translate-y-10"
                                },
                                {
                                    title: "Church Insight",
                                    href: route('church-admin.index'),
                                    description: "Track attendance and growth with tools built for healthy, strategic ministry.",
                                    icon: "📊",
                                    accent: "from-[#34d399]/25 via-[#14b8a6]/10 to-transparent",
                                    border: "border-emerald-300/20",
                                    glow: "shadow-[0_22px_60px_rgba(16,185,129,0.12)]"
                                }
                            ].map((feature, index) => (
                                <Link
                                    key={index}
                                    href={feature.href}
                                    className={[
                                        "group relative block overflow-hidden rounded-[28px] border bg-[#120d1a]/80 p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-red-300/50 hover:bg-[#17111d]/95 focus:outline-none focus:ring-2 focus:ring-red-300/70 focus:ring-offset-2 focus:ring-offset-slate-950",
                                        feature.border,
                                        feature.glow,
                                        feature.offset ?? "",
                                    ].join(" ")}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent}`} />
                                    <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/5 blur-3xl"></div>
                                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                                    <div className="relative z-10">
                                        <div className="mb-6 flex items-center justify-between gap-3">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0f1d]/85 text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:scale-110">
                                                {feature.icon}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-[0.38em] text-slate-300/80">
                                                0{index + 1}
                                            </span>
                                        </div>

                                        <h3 className="mb-3 text-2xl font-bold tracking-[-0.04em] text-white md:text-[1.9rem]">
                                            {feature.title}
                                        </h3>
                                        <p className="text-base leading-relaxed text-slate-200/90">
                                            {feature.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="apga-cta relative overflow-hidden bg-[#080711] py-24 text-white md:py-32">
                    <style>{`
                        @keyframes apga-cta-pulse { 0%, 100% { opacity: .35; transform: scale(.92); } 50% { opacity: .8; transform: scale(1.08); } }
                        @keyframes apga-cta-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
                        .apga-cta-pulse { animation: apga-cta-pulse 5s ease-in-out infinite; }
                        .apga-cta-rise { animation: apga-cta-rise 800ms cubic-bezier(.22,1,.36,1) both; }
                        .apga-cta-rise-delay { animation-delay: 140ms; }
                        .apga-cta-rise-delay-2 { animation-delay: 280ms; }
                        @media (prefers-reduced-motion: reduce) { .apga-cta-pulse, .apga-cta-rise { animation: none; } }
                    `}</style>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(190,24,93,0.2),transparent_32%),linear-gradient(120deg,#080711,#130b19_52%,#090812)]" />
                    <div className="apga-cta-pulse absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-400/20" />
                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />

                    <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                        <div className="apga-cta-rise mx-auto flex w-fit items-center gap-3 border border-red-300/30 bg-red-950/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-red-200">
                            <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.9)]" />
                            Your next step starts here
                        </div>
                        <h2 className="apga-cta-rise apga-cta-rise-delay mt-8 text-4xl font-semibold tracking-tight text-white md:text-7xl">Come as you are.<span className="block bg-gradient-to-r from-white via-red-200 to-red-500 bg-clip-text text-transparent">Grow with us.</span></h2>
                        <p className="apga-cta-rise apga-cta-rise-delay-2 mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">Take the first step in your spiritual journey. Join a community where faith becomes friendship, service becomes purpose, and every week makes room for you.</p>
                        <div className="apga-cta-rise apga-cta-rise-delay-2 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href={route('register')} className="group inline-flex items-center gap-3 rounded-full bg-red-500 px-8 py-4 text-sm font-bold text-white shadow-[0_15px_42px_rgba(239,68,68,0.3)] transition hover:-translate-y-1 hover:bg-red-400">Create your account <span className="transition-transform group-hover:translate-x-1">→</span></Link>
                            <button type="button" onClick={scrollToFooter} className="inline-flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-slate-200 transition hover:border-red-300/70 hover:bg-white/5">Explore the community <span>↓</span></button>
                        </div>
                        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                            <span>Worship</span><span className="h-1 w-1 rounded-full bg-red-400" /><span>Belonging</span><span className="h-1 w-1 rounded-full bg-red-400" /><span>Purpose</span>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="apga-voices relative overflow-hidden bg-[#070914] py-24 text-white md:py-32">
                    <style>{`
                        @keyframes apga-voices-rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
                        @keyframes apga-voices-drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(14px, -10px); } }
                        .apga-voices-rise { animation: apga-voices-rise 750ms cubic-bezier(.22,1,.36,1) both; }
                        .apga-voices-delay { animation-delay: 160ms; }
                        .apga-voices-delay-2 { animation-delay: 320ms; }
                        .apga-voices-drift { animation: apga-voices-drift 7s ease-in-out infinite; }
                        @media (prefers-reduced-motion: reduce) { .apga-voices-rise, .apga-voices-drift { animation: none; } }
                    `}</style>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_45%,rgba(220,38,38,0.16),transparent_28%),radial-gradient(circle_at_88%_15%,rgba(190,24,93,0.14),transparent_28%),linear-gradient(135deg,#070914,#0d1020_55%,#100a12)]" />
                    <div className="apga-voices-drift absolute -right-24 top-16 h-80 w-80 rounded-full border border-red-400/15" />
                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />

                    <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8">
                        <div className="mb-14 grid items-end gap-8 lg:grid-cols-[0.75fr_1.25fr]">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-red-300">Voices of the house</p>
                                <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-6xl">Belonging sounds like this.</h2>
                            </div>
                            <p className="max-w-md border-l border-red-400/50 pl-5 text-sm leading-7 text-slate-400">Real community is heard in the stories people carry home: welcomed, encouraged, and ready to serve.</p>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="apga-voices-rise group relative overflow-hidden border border-red-300/30 bg-gradient-to-br from-red-950/60 via-[#15101d] to-[#0d1020] p-7 md:p-10">
                                <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-red-500/10 blur-3xl transition duration-700 group-hover:bg-red-500/20" />
                                <div className="relative z-10 flex h-full flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between"><span className="font-serif text-7xl leading-none text-red-300/70">“</span><span className="font-mono text-xs tracking-[0.3em] text-red-300/70">01 / 03</span></div>
                                        <p className="mt-6 max-w-2xl text-2xl font-medium leading-relaxed text-white md:text-3xl">This church feels like home. Every Sunday, I am reminded that I am loved, welcomed, and valued. The warmth of the people and the spirit of togetherness make me want to serve with joy.</p>
                                    </div>
                                    <div className="mt-12 flex items-center gap-4 border-t border-white/10 pt-5">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-300 to-rose-600 text-sm font-bold text-white shadow-[0_0_24px_rgba(248,113,113,0.25)]">AT</div>
                                        <div><p className="font-semibold text-white">Adebayo Tolulope</p><p className="text-sm text-slate-400">Welfare Member</p></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    { quote: 'I love how engaging the church website is. It keeps us informed, helps us stay connected, and makes it so easy to join fellowship and prayer opportunities from anywhere.', name: 'Akinyemi Oluwatosin', title: 'Youth Ministry Member', initials: 'AO', code: '02 / 03', accent: 'from-orange-300 to-red-500' },
                                    { quote: 'The platform is beautiful, easy to use, and deeply encouraging. It helps our members stay connected, discover events, and feel part of the church family in a very real way.', name: 'Morenikeji Faith', title: 'Media Team Member', initials: 'MF', code: '03 / 03', accent: 'from-fuchsia-300 to-rose-600' },
                                ].map((testimonial) => (
                                    <div key={testimonial.name} className="apga-voices-rise apga-voices-delay group relative overflow-hidden border border-white/10 bg-white/[0.045] p-6 transition duration-500 hover:-translate-y-1 hover:border-red-300/50 hover:bg-white/[0.08]">
                                        <div className="flex items-start justify-between"><span className="font-serif text-5xl leading-none text-red-300/60">“</span><span className="font-mono text-xs tracking-[0.25em] text-slate-500">{testimonial.code}</span></div>
                                        <p className="mt-4 text-base leading-7 text-slate-200">{testimonial.quote}</p>
                                        <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4"><div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.accent} text-xs font-bold text-white`}>{testimonial.initials}</div><div><p className="text-sm font-semibold text-white">{testimonial.name}</p><p className="text-xs text-slate-500">{testimonial.title}</p></div></div>
                                        <div className="absolute bottom-0 left-0 h-px w-0 bg-red-400 transition-all duration-500 group-hover:w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer
                    id="footer-resources"
                    className={`relative overflow-hidden bg-slate-950 border-t border-red-800/70 transition-all duration-700 ${highlightFooter ? 'ring-2 ring-red-300/80 ring-offset-2 ring-offset-slate-950 shadow-lg shadow-red-950/30' : ''}`}
                >
                    {/* Decorative elements */}
                    <div className="absolute inset-0 bg-slate-900/40"></div>
                    <div className="absolute top-0 left-0 w-96 h-96 bg-red-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                    <div className="container mx-auto px-6 relative z-10">
                        {/* Main Footer Columns */}
                        <div className="py-16 grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                            {/* Column 1: About Church */}
                            <div>
                                <div className="flex items-center space-x-2 mb-6">
                                    <img src={logo} className="h-8" alt="Church Logo" />
                                    <h3 className="text-lg font-bold text-red-400">About APGA</h3>
                                </div>
                                <ul className="space-y-3 text-sm">
                                    <li>
                                        <a href={route('about')} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-400 transition-colors font-medium">About Us</a>
                                    </li>
                                    <li>
                                        <a href={route('church-board')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Board Of Trustees</a>
                                    </li>
                                    <li>
                                        <a href={route('mission')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Our Mission</a>
                                    </li>
                                    <li>
                                        <a href={route('leadership')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Leadership</a>
                                    </li>
                                    <li className="border-t border-red-800/50 pt-3 text-xs leading-relaxed text-gray-400">
                                        <p className="font-semibold text-red-300">Church Leadership</p>
                                        <p className="mt-2">Prophet (Dr.) Samuel Olugbenga Ilesanmi</p>
                                        <p>Evangelist (Mrs.) Esther Omobolanriwa Ilesanmi</p>
                                        <p>Pastor Michael Olanrewaju</p>
                                    </li>
                                    <li>
                                        <a href={route('church-history')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Church History</a>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 2: Getting Involved */}
                            <div>
                                <h3 className="text-lg font-bold text-red-400 mb-6">Get Involved</h3>
                                <ul className="space-y-3 text-sm">
                                    <li>
                                        <a href={route('events')} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-400 transition-colors font-medium">Events</a>
                                    </li>
                                    <li>
                                        <a href={route('small-groups')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Small Groups</a>
                                    </li>
                                    <li>
                                        <a href={route('volunteer')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Volunteer</a>
                                    </li>
                                    <li>
                                        <a href={route('giving')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Giving</a>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 3: Spiritual Resources */}
                            <div>
                                <h3 className="text-lg font-bold text-red-400 mb-6">Spiritual Growth</h3>
                                <ul className="space-y-3 text-sm">
                                    <li>
                                        <a href={route('media')} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-400 transition-colors font-medium">Sermons</a>
                                    </li>
                                    <li>
                                        <a href={route('ministries')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Ministries</a>
                                    </li>
                                    <li>
                                        <a href={route('units')} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-400 transition-colors font-medium">Church Units</a>
                                    </li>
                                    <li>
                                        <a href={route('prayer-requests')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Prayer Requests</a>
                                    </li>
                                    <li>
                                        <a href={route('resources')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Resources</a>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 4: Connect */}
                            <div>
                                <h3 className="text-lg font-bold text-red-400 mb-6">Connect</h3>
                                <ul className="space-y-3 text-sm">
                                    <li>
                                        <a href={route('contact')} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-400 transition-colors font-medium">Contact Us</a>
                                    </li>
                                    <li>
                                        <a href={route('location-hours')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Location & Hours</a>
                                    </li>
                                    <li>
                                        <a href={route('faq')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">FAQ</a>
                                    </li>
                                    <li>
                                        <a href={route('send-message')} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Send Message</a>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 5: Follow Us */}
                            <div>
                                <h3 className="text-lg font-bold text-red-400 mb-6">Follow Us</h3>
                                <ul className="space-y-3 text-sm">
                                    <li>
                                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-400 transition-colors font-medium">Facebook</a>
                                    </li>
                                    <li>
                                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Twitter</a>
                                    </li>
                                    <li>
                                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">Instagram</a>
                                    </li>
                                    <li>
                                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">YouTube</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-red-800/70 py-8">
                            <div className="max-w-xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-300">Church newsletter</p>
                                <h3 className="mt-2 text-2xl font-bold text-white">Receive church updates</h3>
                                <p className="mt-2 text-sm text-slate-300">Get service notices, ministry news, and upcoming church moments in your inbox.</p>
                                {flash?.newsletter_success && <p className="mt-3 text-sm font-medium text-emerald-300">{flash.newsletter_success}</p>}
                                <form onSubmit={submitNewsletter} className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <input type="email" value={newsletterForm.data.email} onChange={(event) => newsletterForm.setData('email', event.target.value)} placeholder="you@example.com" required className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500" />
                                    <button type="submit" disabled={newsletterForm.processing} className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:bg-red-400">{newsletterForm.processing ? 'Subscribing...' : 'Subscribe'}</button>
                                </form>
                                {newsletterForm.errors.email && <p className="mt-2 text-xs text-red-300">{newsletterForm.errors.email}</p>}
                            </div>
                        </div>

                        {/* Church Information */}
                        <div className="py-8 border-t border-red-800/70">
                            <div className="bg-slate-900/90 border border-red-800/70 rounded-lg p-6">
                                <div className="flex items-start gap-3 mb-3">
                                    <svg className="w-5 h-5 text-slate-200 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13H17.5V11.5H12.5V7Z"/>
                                    </svg>
                                    <h4 className="font-semibold text-slate-100 text-sm">Welcome to APGA Worldwide</h4>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    APGA Worldwide is a faith-based community dedicated to spiritual growth, fellowship, and service. We believe in the power of community and invite everyone to join us on their spiritual journey. Whether you're new to church or a longtime member, we look forward to welcoming you.
                                </p>
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="py-8 border-t border-red-800/70 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                            <div className="flex gap-6">
                                <a href={route('privacy')} target="_blank" rel="noopener noreferrer" className="hover:text-slate-100 transition-colors">Privacy Policy</a>
                                <a href={route('terms')} target="_blank" rel="noopener noreferrer" className="hover:text-slate-100 transition-colors">Terms of Service</a>
                                <a href={route('support')} target="_blank" rel="noopener noreferrer" className="hover:text-slate-100 transition-colors">Contact</a>
                            </div>
                            <p className="text-slate-400">© {new Date().getFullYear()} APGA Worldwide. All Rights Reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
