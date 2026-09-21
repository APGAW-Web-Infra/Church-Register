import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Task { type: string; priority: string; name: string; details: string }

export default function OutreachActions({ tasks }: { tasks: Task[] }) {
    return <AuthenticatedLayout><Head title="Outreach Actions" /><main className="mx-auto max-w-5xl px-4 py-8"><Link href={route('church-admin.index')} className="text-sm font-semibold text-red-700">← Admin dashboard</Link><div className="mt-5 rounded-3xl border border-red-100 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">Engagement pipeline</p><div className="mt-2 flex items-center justify-between"><h1 className="text-2xl font-bold text-slate-900">Outreach actions</h1><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{tasks.length}</span></div><div className="mt-6 space-y-3">{tasks.length ? tasks.map((task, index) => <article key={`${task.type}-${task.name}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">{task.name}</h2><span className="text-xs font-bold uppercase text-amber-700">{task.priority}</span></div><p className="mt-1 text-sm text-slate-600">{task.details}</p></article>) : <p className="text-sm text-slate-500">No outreach actions are currently waiting.</p>}</div></div></main></AuthenticatedLayout>;
}
