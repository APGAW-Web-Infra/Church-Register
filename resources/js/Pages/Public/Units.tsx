import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Unit = {
    slug: string;
    name: string;
    category: string;
    summary: string;
    aim: string;
    objectives: string[];
    duties: string[];
    leadership: Array<{ name: string; role: string }>;
    members: string[];
    highlights: string[];
};

export default function Units({ units = [] }: { units?: Unit[] }) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = useMemo(() => {
        const values = new Set(['all']);
        units.forEach((unit) => values.add(unit.category));
        return Array.from(values);
    }, [units]);

    const visibleUnits = useMemo(() => {
        if (selectedCategory === 'all') {
            return units;
        }

        return units.filter((unit) => unit.category === selectedCategory);
    }, [selectedCategory, units]);

    return (
        <>
            <Head title="Church Units & Departments - APGA Worldwide" />
            <div className="min-h-screen bg-slate-950 text-slate-100">
                <nav className="border-b border-red-800/70 bg-slate-950/95 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href="/" className="text-2xl font-bold text-red-400">APGA Worldwide</Link>
                        <Link href="/" className="rounded-full border border-red-700 px-4 py-2 text-sm text-red-100 transition hover:bg-red-700 hover:text-white">
                            Back to Home
                        </Link>
                    </div>
                </nav>

                <main className="mx-auto max-w-7xl px-6 py-16">
                    <div className="mb-12 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">All-inclusive church units</p>
                        <h1 className="mt-4 text-4xl font-bold text-white md:text-5xl">Church Units & Departments</h1>
                        <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-300">
                            Every unit and department is structured to nurture discipleship, leadership, service, and spiritual growth across the church.
                        </p>
                    </div>

                    <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
                        {categories.map((category) => {
                            const isActive = selectedCategory === category;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedCategory(category)}
                                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? 'border-red-500 bg-red-600 text-white'
                                            : 'border-red-700/80 bg-slate-900 text-red-100 hover:bg-slate-800'
                                    }`}
                                >
                                    {category === 'all' ? 'All Categories' : category}
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
                        {visibleUnits.map((unit) => (
                            <article key={unit.slug} className="rounded-3xl border border-red-800/70 bg-slate-900/85 p-7 shadow-lg shadow-red-950/20 transition duration-300 hover:-translate-y-1 hover:border-red-500/80">
                                <div className="mb-4 h-2.5 w-20 rounded-full bg-gradient-to-r from-red-500 to-rose-400"></div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-300">{unit.category}</p>
                                <h2 className="mt-4 text-2xl font-bold text-white">{unit.name}</h2>
                                <p className="mt-4 text-sm leading-relaxed text-slate-300">{unit.summary}</p>

                                <div className="mt-5 flex items-center justify-between gap-3 border-t border-red-900/60 pt-4 text-sm text-slate-300">
                                    <span>{unit.highlights.length} focus areas</span>
                                    <Link href={route('units.detail', unit.slug)} className="font-semibold text-red-300 transition hover:text-red-200">
                                        View details →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-14 rounded-3xl border border-red-800/70 bg-gradient-to-r from-red-900/20 to-slate-900 p-8 text-center">
                        <h3 className="text-2xl font-bold text-white">Each unit is built for service</h3>
                        <p className="mt-3 text-slate-300">From worship and discipleship to outreach, administration, and care, every unit exists to strengthen the church and bless the community.</p>
                        <div className="mt-6">
                            <Link href={route('register')} className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500">
                                Join the work of God
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
