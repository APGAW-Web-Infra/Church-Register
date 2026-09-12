import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    sector?: string;
    date_of_birth?: string;
    education_level?: string;
    skills_of_interest?: string[];
    state?: string;
    lga?: string;
    nin?: string;
    passport_number?: string;
    referral_code?: string;
    email_verified_at?: string;
    memberProfile?: { avatar_path?: string | null };
}

interface SelectOption {
    id: string;
    name: string;
}

interface UpdateProfileInformationFormProps {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
    user: User;
    sectors: SelectOption[];
    educationLevels: SelectOption[];
    states: SelectOption[];
    memberProfilePhotoUrl?: string | null;
}

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
    className = '',
    user,
    sectors,
    educationLevels,
    states,
    memberProfilePhotoUrl,
}: UpdateProfileInformationFormProps) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<{
        name: string;
        email: string;
        phone: string;
        address: string;
        sector: string;
        date_of_birth: string;
        education_level: string;
        skills_of_interest: string;
        state: string;
        lga: string;
        nin: string;
        passport_number: string;
        referral_code: string;
        profile_photo: File | null;
    }>({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        sector: user.sector || '',
        date_of_birth: user.date_of_birth || '',
        education_level: user.education_level || '',
        skills_of_interest: Array.isArray(user.skills_of_interest) ? user.skills_of_interest.join(', ') : (typeof user.skills_of_interest === 'string' ? user.skills_of_interest : ''),
        state: user.state || '',
        lga: user.lga || '',
        nin: user.nin || '',
        passport_number: user.passport_number || '',
        referral_code: user.referral_code || '',
        profile_photo: null,
    });

    const [statesList, setStatesList] = useState<string[]>([]);
    const [lgasList, setLgasList] = useState<string[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingLgas, setLoadingLgas] = useState(false);

    useEffect(() => {
        fetchStates();
    }, []);

    useEffect(() => {
        if (data.state) {
            fetchLGAs(data.state);
        }
    }, [data.state]);

    const fetchStates = async () => {
        setLoadingStates(true);
        try {
            const response = await fetch('/api/states');
            const result = await response.json();
            setStatesList(result);
        } catch (error) {
            console.error('Error fetching states:', error);
        } finally {
            setLoadingStates(false);
        }
    };

    const fetchLGAs = async (selectedState: string) => {
        if (!selectedState) {
            setLgasList([]);
            return;
        }
        setLoadingLgas(true);
        try {
            const response = await fetch(`/api/lgas?state=${selectedState}`);
            const result = await response.json();
            setLgasList(result);
        } catch (error) {
            console.error('Error fetching LGAs:', error);
        } finally {
            setLoadingLgas(false);
        }
    };

    const handleStateChange = (value: string) => {
        setData('state', value);
        setData('lga', '');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const submitData = {
            ...data,
            skills_of_interest: data.skills_of_interest
                ? data.skills_of_interest.split(',').map(skill => skill.trim()).filter(skill => skill)
                : [],
        };

        patch(route('profile.update'), {
            ...submitData,
            forceFormData: true,
        });
    };

    return (
        <section className={className}>
            <header className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
                    <InputLabel htmlFor="profile_photo" value="Member profile photo" />
                    {memberProfilePhotoUrl && <img src={memberProfilePhotoUrl} alt="Current profile" className="mt-3 h-20 w-20 rounded-full object-cover" />}
                    <input id="profile_photo" name="profile_photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setData('profile_photo', e.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white" />
                    <p className="mt-1 text-xs text-gray-500">Upload a clear JPG, PNG, or WebP image up to 5 MB.</p>
                    <InputError className="mt-2" message={errors.profile_photo} />
                </div>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" value="Full Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email Address" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="referral_code" value="Referred by (optional member code)" />
                    <TextInput
                        id="referral_code"
                        className="mt-1 block w-full uppercase"
                        value={data.referral_code}
                        onChange={(e) => setData('referral_code', e.target.value.toUpperCase())}
                        placeholder="Enter the referring member's code"
                        maxLength={10}
                    />
                    <p className="mt-1 text-xs text-gray-500">You can add or change this later from your profile.</p>
                    <InputError className="mt-2" message={errors.referral_code} />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="phone" value="Phone Number" />
                        <TextInput
                            id="phone"
                            type="tel"
                            className="mt-1 block w-full"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="+234 XXX XXX XXXX"
                        />
                        <InputError className="mt-2" message={errors.phone} />
                    </div>

                    <div>
                        <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                        <TextInput
                            id="date_of_birth"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.date_of_birth}
                            onChange={(e) => setData('date_of_birth', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.date_of_birth} />
                    </div>
                </div>

                {/* Address */}
                <div>
                    <InputLabel htmlFor="address" value="Address" />
                    <textarea
                        id="address"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-red-500 dark:focus:border-red-600 focus:ring-red-500 dark:focus:ring-red-600 shadow-sm"
                        rows={3}
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder="Enter your full address"
                    />
                    <InputError className="mt-2" message={errors.address} />
                </div>

                {/* Location Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="state" value="State of Origin" />
                        <select
                            id="state"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-red-500 dark:focus:border-red-600 focus:ring-red-500 dark:focus:ring-red-600 shadow-sm"
                            value={data.state}
                            onChange={(e) => handleStateChange(e.target.value)}
                            disabled={loadingStates}
                        >
                            <option value="">{loadingStates ? 'Loading states...' : 'Select state'}</option>
                            {statesList.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.state} />
                    </div>

                    <div>
                        <InputLabel htmlFor="lga" value="Local Government Area (LGA)" />
                        <select
                            id="lga"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400 shadow-sm disabled:opacity-50"
                            value={data.lga}
                            onChange={(e) => setData('lga', e.target.value)}
                            disabled={!data.state || loadingLgas || lgasList.length === 0}
                        >
                            <option value="">
                                {!data.state ? 'Select a state first' : loadingLgas ? 'Loading LGAs...' : 'Select LGA'}
                            </option>
                            {lgasList.map((lga) => (
                                <option key={lga} value={lga}>{lga}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.lga} />
                    </div>
                </div>

                {/* Professional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="sector" value="Primary Sector of Interest" />
                        <select
                            id="sector"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-red-500 dark:focus:border-red-600 focus:ring-red-500 dark:focus:ring-red-600 shadow-sm"
                            value={data.sector}
                            onChange={(e) => setData('sector', e.target.value)}
                        >
                            <option value="">Select sector</option>
                            {sectors.map((sector) => (
                                <option key={sector.id} value={sector.id}>{sector.name}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.sector} />
                    </div>

                    <div>
                        <InputLabel htmlFor="education_level" value="Education Level" />
                        <select
                            id="education_level"
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-red-500 dark:focus:border-red-600 focus:ring-red-500 dark:focus:ring-red-600 shadow-sm"
                            value={data.education_level}
                            onChange={(e) => setData('education_level', e.target.value)}
                        >
                            <option value="">Select education level</option>
                            {educationLevels.map((level) => (
                                <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.education_level} />
                    </div>
                </div>

                {/* Skills */}
                <div>
                    <InputLabel htmlFor="skills_of_interest" value="Skills of Interest (comma-separated)" />
                    <TextInput
                        id="skills_of_interest"
                        className="mt-1 block w-full"
                        value={data.skills_of_interest}
                        onChange={(e) => setData('skills_of_interest', e.target.value)}
                        placeholder="e.g., web development, digital marketing, business analysis"
                    />
                    <InputError className="mt-2" message={errors.skills_of_interest} />
                </div>

                {/* Identity Verification */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
                        Identity Verification (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputLabel htmlFor="nin" value="National Identification Number (NIN)" />
                            <TextInput
                                id="nin"
                                className="mt-1 block w-full"
                                value={data.nin}
                                onChange={(e) => setData('nin', e.target.value)}
                                placeholder="12345678901"
                                maxLength={11}
                            />
                            <InputError className="mt-2" message={errors.nin} />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Required for certain funding applications
                            </p>
                        </div>

                        <div>
                            <InputLabel htmlFor="passport_number" value="International Passport Number" />
                            <TextInput
                                id="passport_number"
                                className="mt-1 block w-full"
                                value={data.passport_number}
                                onChange={(e) => setData('passport_number', e.target.value)}
                                placeholder="A12345678"
                            />
                            <InputError className="mt-2" message={errors.passport_number} />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                For international opportunities and programs
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email Verification Notice */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    Email Verification Required
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                    <p>
                                        Your email address is unverified. Please check your inbox and click the verification link.
                                    </p>
                                    <div className="mt-3">
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                                        >
                                            Resend verification email
                                        </Link>
                                    </div>
                                </div>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving...' : 'Save Profile Information'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
