import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Eye, EyeOff, Users, Shield, Users2, Calendar, HeartHandshake, Landmark } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in - APGA Worldwide" />

            <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#07111c_0%,#101b2d_48%,#1f1630_100%)] text-slate-100">
                <div className="absolute left-[-80px] top-[-80px] h-72 w-72 rounded-full bg-red-800/30 blur-3xl" />
                <div className="absolute bottom-[-80px] right-[-40px] h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />

                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
                    <div className="w-full max-w-6xl overflow-hidden rounded-[34px] border border-amber-100/20 shadow-[0_45px_160px_rgba(0,0,0,0.7)]">
                        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">

                            <section className="relative hidden min-h-[560px] lg:flex lg:flex-col lg:justify-between overflow-hidden bg-[linear-gradient(135deg,#07152b_0%,#102447_50%,#3b1228_100%)] p-10 text-white">
                                <div className="absolute inset-0">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_21%,rgba(186,80,50,0.36),transparent_14%),radial-gradient(circle_at_58%_78%,rgba(245,197,138,0.15),transparent_18%)]" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/30 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-md">
                                            <img src="/images/logo.png" alt="APGA logo" className="h-11 w-11 object-contain" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-amber-100/80">APGA Worldwide</p>
                                            <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight">Welcome Back</h1>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-10">
                                    <div className="mb-4">
                                        <p className="text-xl font-semibold text-cyan-100">Apostolic Power Glorious Assembly</p>
                                        <p className="mt-3 max-w-md text-sm leading-6 text-slate-200/85">
                                            Growing God’s Kingdom together in faith, purpose, and community.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-8">
                                        {[
                                            { label: 'Attendance', meta: 'Track', icon: Users },
                                            { label: 'Events', meta: 'Calendar', icon: Calendar },
                                            { label: 'Community', meta: 'Connect', icon: Users2 },
                                            { label: 'Prayer', meta: 'Request', icon: HeartHandshake },
                                        ].map(({ label, meta, icon: Icon }) => (
                                            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.12] hover:-translate-y-1">
                                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-100">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="text-sm font-bold">{label}</div>
                                                <div className="mt-1 text-[11px] text-slate-300">{meta}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative z-10 mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
                                    <p className="text-xs font-medium italic leading-relaxed text-slate-100/95">
                                        “Therefore if any man be in Christ, he is a new creature.” — 2 Corinthians 5:17
                                    </p>
                                </div>
                            </section>

                            <section className="flex min-h-[560px] w-full flex-col justify-center bg-[linear-gradient(180deg,#16223a_0%,#111827_100%)] p-8 lg:p-12">
                                <div className="mx-auto w-full max-w-md">
                                    <div className="mb-8 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/30 bg-amber-50 text-red-700 shadow-lg">
                                            <Landmark className="h-8 w-8" />
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight text-white">Sign In</h2>
                                        <p className="mt-2 text-sm text-slate-400">Access your church account</p>
                                    </div>

                                    {status && (
                                        <div className="mb-5 rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-xs font-medium text-red-100">
                                            {status}
                                        </div>
                                    )}

                                    <form onSubmit={submit} className="space-y-5">
                                        <div>
                                            <InputLabel htmlFor="email" value="Email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70"
                                                autoComplete="username"
                                                isFocused={true}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="your@email.com"
                                            />
                                            <InputError message={errors.email} className="mt-2 text-xs text-red-300" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="password" value="Password" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                            <div className="relative">
                                                <TextInput
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={data.password}
                                                    className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 pr-11 text-sm text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70"
                                                    autoComplete="current-password"
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Enter password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-amber-200 focus:outline-none"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <InputError message={errors.password} className="mt-2 text-xs text-red-300" />
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <label className="flex items-center gap-2 text-xs text-slate-400">
                                                <Checkbox
                                                    name="remember"
                                                    checked={data.remember}
                                                    onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                                                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-300 focus:ring-amber-300"
                                                />
                                                Remember me
                                            </label>

                                            {canResetPassword && (
                                                <Link href={route('password.request')} className="text-xs font-bold text-amber-200 transition hover:text-white hover:underline">
                                                    Forgot?
                                                </Link>
                                            )}
                                        </div>

                                        <PrimaryButton
                                            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_rgba(200,50,50,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(230,129,41,0.4)] disabled:opacity-70"
                                            disabled={processing}
                                        >
                                            {processing ? 'Signing in...' : 'Sign In'}
                                        </PrimaryButton>
                                    </form>

                                    <div className="mt-7 text-center">
                                        <p className="text-sm text-slate-400">
                                            New member?{' '}
                                            <Link href={route('register')} className="font-bold text-amber-200 transition hover:text-white hover:underline">
                                                Create account
                                            </Link>
                                        </p>
                                    </div>

                                    <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-700 pt-5 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                                        <Shield className="h-4 w-4" />
                                        <span>Secure • Private • Faith-Based</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
