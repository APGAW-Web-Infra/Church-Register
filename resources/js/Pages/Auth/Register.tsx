import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Eye, EyeOff, Users, Shield, BarChart3, TrendingUp, Users2, HeartHandshake, Calendar, Landmark } from 'lucide-react';

export default function Register({ referralCode = '' }: { referralCode?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        membership_status: '1',
        workforce_status: '',
        password: '',
        password_confirmation: '',
        state: '',
        lga: '',
        referral_code: referralCode,
        profile_photo: null as File | null,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [states, setStates] = useState<string[]>([]);
    const [lgas, setLgas] = useState<string[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingLgas, setLoadingLgas] = useState(false);

    useEffect(() => {
        fetchStates();
    }, []);

    const fetchStates = async () => {
        setLoadingStates(true);
        try {
            const response = await fetch('/api/states');
            const result = await response.json();
            setStates(result);
        } catch (error) {
            console.error('Error fetching states:', error);
        } finally {
            setLoadingStates(false);
        }
    };

    const fetchLGAs = async (selectedState: string) => {
        if (!selectedState) {
            setLgas([]);
            return;
        }
        setLoadingLgas(true);
        try {
            const response = await fetch(`/api/lgas?state=${selectedState}`);
            const result = await response.json();
            setLgas(result);
        } catch (error) {
            console.error('Error fetching LGAs:', error);
        } finally {
            setLoadingLgas(false);
        }
    };

    const handleStateChange = (value: string) => {
        setData('state', value);
        setData('lga', '');
        fetchLGAs(value);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            forceFormData: true,
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register - APGA Worldwide" />

            <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#07111c_0%,#101b2d_48%,#1f1630_100%)] text-slate-100">
                <div className="absolute left-[-80px] top-[-80px] h-72 w-72 rounded-full bg-red-800/30 blur-3xl" />
                <div className="absolute bottom-[-80px] right-[-40px] h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />

                <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
                    <div className="w-full max-w-7xl overflow-hidden rounded-[34px] border border-amber-100/20 shadow-[0_45px_160px_rgba(0,0,0,0.7)]">
                        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">

                            <section className="relative hidden min-h-[660px] lg:flex lg:flex-col lg:justify-between overflow-hidden bg-[linear-gradient(135deg,#07152b_0%,#102447_50%,#3b1228_100%)] p-10 text-white">
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
                                            <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight">Join APGA</h1>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-10">
                                    <div className="mb-4">
                                        <p className="text-xl font-semibold text-cyan-100">Apostolic Power Glorious Assembly</p>
                                        <p className="mt-3 max-w-md text-sm leading-6 text-slate-200/85">
                                            A faith community growing together in grace, service, and purpose.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-8">
                                        {[
                                            { label: 'Attendance', meta: 'Services', icon: Users },
                                            { label: 'Events', meta: 'Calendar', icon: Calendar },
                                            { label: 'Invitations', meta: 'Grow', icon: TrendingUp },
                                            { label: 'Community', meta: 'Connect', icon: Users2 },
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
                                        “Come to me, all you who are weary.” — Matthew 11:28
                                    </p>
                                </div>
                            </section>

                            <section className="flex min-h-[660px] w-full flex-col justify-center bg-[linear-gradient(180deg,#16223a_0%,#111827_100%)] p-8 lg:p-10">
                                <div className="w-full max-w-2xl mx-auto">
                                    <div className="mb-8 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/30 bg-amber-50 text-red-700 shadow-lg">
                                            <Landmark className="h-8 w-8" />
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight text-white">Create Account</h2>
                                        <p className="mt-2 text-sm text-slate-400">Join our faith community</p>
                                    </div>

                                    <form onSubmit={submit} className="space-y-4">
                                        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/30 p-4">
                                            <InputLabel htmlFor="profile_photo" value="Profile Photo (required)" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                            <input id="profile_photo" name="profile_photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setData('profile_photo', e.target.files?.[0] ?? null)} className="block w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-xs file:font-black file:text-white" required />
                                            <p className="mt-2 text-[11px] text-slate-400">JPG, PNG, or WebP up to 5 MB.</p>
                                            <InputError message={errors.profile_photo} className="mt-2 text-xs text-red-300" />
                                        </div>

                                        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/30 p-4">
                                            <InputLabel htmlFor="referral_code" value="Referral Code (optional)" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                            <TextInput id="referral_code" name="referral_code" value={data.referral_code} onChange={(e) => setData('referral_code', e.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70" placeholder="Enter a member code" maxLength={10} />
                                            <InputError message={errors.referral_code} className="mt-2 text-xs text-red-300" />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="name" value="Full Name" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <TextInput id="name" name="name" value={data.name} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70" autoComplete="name" isFocused={true} onChange={(e) => setData('name', e.target.value)} required placeholder="John Doe" />
                                                <InputError message={errors.name} className="mt-2 text-xs text-red-300" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="email" value="Email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <TextInput id="email" type="email" name="email" value={data.email} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70" autoComplete="username" onChange={(e) => setData('email', e.target.value)} required placeholder="your@email.com" />
                                                <InputError message={errors.email} className="mt-2 text-xs text-red-300" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="phone" value="Phone Number" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <TextInput id="phone" type="tel" name="phone" value={data.phone} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70" onChange={(e) => setData('phone', e.target.value)} required placeholder="+234 800 000 0000" />
                                                <InputError message={errors.phone} className="mt-2 text-xs text-red-300" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="date_of_birth" value="Birthday" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <TextInput id="date_of_birth" type="date" name="date_of_birth" value={data.date_of_birth} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70" onChange={(e) => setData('date_of_birth', e.target.value)} required />
                                                <InputError message={errors.date_of_birth} className="mt-2 text-xs text-red-300" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="membership_status" value="Membership Type" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <select id="membership_status" name="membership_status" value={data.membership_status} onChange={(e) => { setData('membership_status', e.target.value); if (e.target.value === '2') setData('workforce_status', ''); }} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70">
                                                    <option value="1">Regular Member</option>
                                                    <option value="2">First-Timer</option>
                                                </select>
                                                <InputError message={errors.membership_status} className="mt-2 text-xs text-red-300" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="gender" value="Gender" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <select id="gender" name="gender" value={data.gender} onChange={(e) => setData('gender', e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70">
                                                    <option value="">Select</option>
                                                    <option value="1">Male</option>
                                                    <option value="2">Female</option>
                                                </select>
                                                <InputError message={errors.gender} className="mt-2 text-xs text-red-300" />
                                            </div>
                                        </div>

                                        {data.membership_status === '1' && (
                                            <div>
                                                <InputLabel htmlFor="workforce_status" value="Workforce Status" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <select id="workforce_status" name="workforce_status" value={data.workforce_status} onChange={(e) => setData('workforce_status', e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70">
                                                    <option value="">Select</option>
                                                    <option value="1">I Belong To A Unit</option>
                                                    <option value="2">I Don&apos;t Belong To A Unit</option>
                                                </select>
                                                <InputError message={errors.workforce_status} className="mt-2 text-xs text-red-300" />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="state" value="State" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <select id="state" name="state" value={data.state} onChange={(e) => handleStateChange(e.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70">
                                                    <option value="">{loadingStates ? 'Loading...' : 'State'}</option>
                                                    {states.map((state) => <option key={state} value={state}>{state}</option>)}
                                                </select>
                                                <InputError message={errors.state} className="mt-2 text-xs text-red-300" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="lga" value="Local Gov." className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <select id="lga" name="lga" value={data.lga} onChange={(e) => setData('lga', e.target.value)} disabled={!data.state || loadingLgas} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70 disabled:cursor-not-allowed disabled:opacity-50">
                                                    <option value="">{!data.state ? 'State first' : loadingLgas ? 'Loading...' : 'LGA'}</option>
                                                    {lgas.map((lga) => <option key={lga} value={lga}>{lga}</option>)}
                                                </select>
                                                <InputError message={errors.lga} className="mt-2 text-xs text-red-300" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="password" value="Password" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <div className="relative">
                                                    <TextInput id="password" type={showPassword ? 'text' : 'password'} name="password" value={data.password} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 pr-11 text-sm text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70" autoComplete="new-password" onChange={(e) => setData('password', e.target.value)} required placeholder="Strong password" />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-amber-200 focus:outline-none">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                                </div>
                                                <InputError message={errors.password} className="mt-2 text-xs text-red-300" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300" />
                                                <div className="relative">
                                                    <TextInput id="password_confirmation" type={showConfirmPassword ? 'text' : 'password'} name="password_confirmation" value={data.password_confirmation} className="w-full rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 pr-11 text-sm text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/70" autoComplete="new-password" onChange={(e) => setData('password_confirmation', e.target.value)} required placeholder="Confirm password" />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-amber-200 focus:outline-none">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                                </div>
                                                <InputError message={errors.password_confirmation} className="mt-2 text-xs text-red-300" />
                                            </div>
                                        </div>

                                        <PrimaryButton className="w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_rgba(200,50,50,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(230,129,41,0.4)] disabled:opacity-70" disabled={processing}>
                                            {processing ? 'Creating Account...' : 'Create Account'}
                                        </PrimaryButton>
                                    </form>

                                    <div className="mt-7 text-center">
                                        <p className="text-sm text-slate-400">
                                            Already a member?{' '}
                                            <Link href={route('login')} className="font-bold text-amber-200 transition hover:text-white hover:underline">
                                                Sign In
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
