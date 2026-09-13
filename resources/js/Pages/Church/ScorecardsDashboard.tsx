import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface Scorecard {
    id: number;
    period_type: string;
    title: string;
    report_date: string;
    invitation_count: number;
    new_visitors_count: number;
    conversion_count: number;
    score: number;
    notes?: string;
}

interface ValidatedInvitationCount {
    inviter?: {
        id?: number;
        name?: string | null;
        referral_code?: string | null;
        memberProfile?: { id?: number; user_id?: number; avatar_path?: string | null } | null;
    } | null;
    avatar_url?: string | null;
    validated_count: number;
}

export default function ScorecardsDashboard({ scorecards, validatedInvitationCounts = [], flash }: { scorecards: Scorecard[]; validatedInvitationCounts?: ValidatedInvitationCount[]; flash?: { success?: string } }) {
    return (
        <AuthenticatedLayout>
            <Head title="Invitation League & Scorecards" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-600">Scorecards</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">Invitation League & Church Scorecards</h1>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="mb-8 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Validated invitation league</p><h2 className="mt-2 text-xl font-bold text-slate-900">Invitations confirmed by Sunday attendance</h2></div>
                        <p className="text-xs text-slate-500">Registration alone never counts.</p>
                    </div>
                    {validatedInvitationCounts.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{validatedInvitationCounts.map((entry, index) => (
                        <div key={`${entry.inviter?.name}-${index}`} className="rounded-2xl border border-red-100 bg-red-50 p-4">
                            <div className="flex items-center gap-3">
                                {entry.avatar_url ? (
                                    <img src={entry.avatar_url} alt={entry.inviter?.name || 'Member'} className="h-12 w-12 rounded-full object-cover border border-red-200 bg-white shadow-sm" />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-white text-xs font-bold text-red-700">
                                        {String(entry.inviter?.name || 'M').slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">#{index + 1}</p>
                                    <p className="mt-1 truncate font-semibold text-slate-900">{entry.inviter?.name || 'Member'}</p>
                                </div>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{entry.validated_count}</p>
                            <p className="text-xs text-slate-500">validated invitations</p>
                        </div>
                    ))}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No validated invitations yet.</div>}
                </div>

                <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-red-100 text-left">
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Period</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Title</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Date</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Score</th>
                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">Visitors</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-red-50 bg-white">
                            {scorecards.length > 0 ? scorecards.map((scorecard) => (
                                <tr key={scorecard.id} className="hover:bg-red-50/40">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800 capitalize">{scorecard.period_type}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{scorecard.title}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{scorecard.report_date}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{scorecard.score}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{scorecard.new_visitors_count}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No scorecards have been recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
