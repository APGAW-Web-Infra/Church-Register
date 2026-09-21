import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Member { id: number; name: string; department: string; type: string }

export default function FollowUpQueue({ members }: { members: Member[] }) {
    return <AuthenticatedLayout><Head title="Follow-up Queue" /><main className="mx-auto max-w-5xl px-4 py-8"><Link href={route('church-admin.index')} className="text-sm font-semibold text-red-700">← Admin dashboard</Link><div className="mt-5 rounded-3xl border border-red-100 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">Follow-up queue</p><div className="mt-2 flex items-center justify-between"><h1 className="text-2xl font-bold text-slate-900">Members to contact</h1><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{members.length}</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{members.length ? members.map((member) => <article key={member.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">{member.name}</h2><span className="text-xs font-bold uppercase text-red-700">{member.type}</span></div><p className="mt-1 text-sm text-slate-500">{member.department}</p></article>) : <p className="text-sm text-slate-500">No members are currently waiting for follow-up.</p>}</div></div></main></AuthenticatedLayout>;
}
