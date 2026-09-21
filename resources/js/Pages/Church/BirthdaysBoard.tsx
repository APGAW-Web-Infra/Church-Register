import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Birthday { id: number; name: string; department: string; date_of_birth: string }

export default function BirthdaysBoard({ birthdays }: { birthdays: Birthday[] }) {
    return <AuthenticatedLayout><Head title="Member Birthdays" /><main className="mx-auto max-w-5xl px-4 py-8"><Link href={route('church-admin.index')} className="text-sm font-semibold text-red-700">← Admin dashboard</Link><div className="mt-5 rounded-3xl border border-amber-100 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">Member moments</p><div className="mt-2 flex items-center justify-between"><h1 className="text-2xl font-bold text-slate-900">Upcoming birthdays</h1><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{birthdays.length}</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{birthdays.length ? birthdays.map((birthday) => <article key={birthday.id} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4"><h2 className="font-semibold text-slate-900">{birthday.name}</h2><p className="mt-1 text-sm text-slate-500">{birthday.department}</p><p className="mt-3 text-sm font-bold text-amber-700">{birthday.date_of_birth}</p></article>) : <p className="text-sm text-slate-500">No birthdays are currently recorded.</p>}</div></div></main></AuthenticatedLayout>;
}
