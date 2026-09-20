import { Head, Link } from '@inertiajs/react';

export default function Leadership() {
    const leaders = [
        {
            role: 'Vice-President, APGAW',
            name: 'Evangelist (Mrs.) Esther Omobolanriwa Ilesanmi',
            bio: 'Serving the church through prayer, evangelism, discipleship, and compassionate spiritual care.',
            image: '/images/Firstlady.jpeg',
        },
        {
            role: 'Senior Pastor, Church Administration',
            name: 'Pastor Michael Olanrewaju',
            bio: 'Leading church administration, pastoral care, teaching, and the day-to-day shepherding of the church family.'
        }
    ];

    return (
        <>
            <Head title="Leadership - APGA Worldwide" />

            <div className="min-h-screen bg-slate-950 text-slate-100">
                <nav className="border-b border-red-800/70 bg-slate-950/95 backdrop-blur-sm">
                    <div className="container mx-auto flex items-center justify-between px-6 py-4">
                        <Link href="/" className="text-2xl font-bold text-red-400">
                            APGA Worldwide
                        </Link>
                        <Link href="/" className="text-red-200 transition hover:text-white">
                            Back to Home
                        </Link>
                    </div>
                </nav>

                <div className="container mx-auto max-w-5xl px-6 py-16">
                    <h1 className="mb-4 text-4xl font-bold text-white">Church Leadership</h1>
                    <p className="mb-12 text-lg text-slate-300">
                        Meet the leaders guiding our church family in worship, prayer, discipleship, and service.
                    </p>

                    <div className="mb-12 overflow-hidden rounded-3xl border border-red-800/70 bg-slate-900/80 p-6 shadow-xl shadow-red-950/20">
                        <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
                            <img
                                src="/images/President_GO.jpeg"
                                alt="Prophet (Dr.) Samuel Olugbenga Ilesanmi"
                                className="h-52 w-full rounded-2xl border border-red-700 object-cover md:h-60"
                            />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">President &amp; General Overseer, APGAW</p>
                                <h2 className="mt-3 text-3xl font-bold text-white">Prophet (Dr.) Samuel Olugbenga Ilesanmi</h2>
                                <p className="mt-3 text-slate-300">
                                    The president provides spiritual direction, pastoral oversight, and a clear vision for worship, discipleship, and church growth across the fellowship.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
                        {leaders.map((leader, index) => (
                            <div key={index} className="rounded-2xl border border-red-800/70 bg-slate-900/80 p-8 shadow-lg shadow-red-950/20">
                                {leader.image && (
                                    <img
                                        src={leader.image}
                                        alt={leader.name}
                                        className="mx-auto mb-6 aspect-square h-auto w-full max-w-56 rounded-2xl border border-red-700 object-cover object-center"
                                    />
                                )}
                                {!leader.image && (
                                    <div
                                        role="img"
                                        aria-label={`Portrait placeholder for ${leader.name}`}
                                        className="mx-auto mb-6 flex aspect-square w-full max-w-56 items-center justify-center rounded-2xl border border-dashed border-red-700 bg-gradient-to-br from-slate-800 via-slate-900 to-red-950 text-5xl font-bold tracking-[0.18em] text-red-300"
                                    >
                                        PM
                                    </div>
                                )}
                                <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">{leader.role}</div>
                                <h3 className="mb-3 text-2xl font-bold text-white">{leader.name}</h3>
                                <p className="text-slate-300">{leader.bio}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mb-12 rounded-2xl border border-red-800/70 bg-slate-900/80 p-8">
                        <h2 className="mb-4 text-2xl font-bold text-white">Our Leadership Commitment</h2>
                        <p className="mb-4 text-slate-300">
                            Our leaders are committed to shepherding the church with wisdom, humility, and a love for Christ and people. We believe in:
                        </p>
                        <ul className="list-disc space-y-2 pl-6 text-slate-300">
                            <li>Prayerful leadership and pastoral care</li>
                            <li>Biblical teaching and spiritual growth</li>
                            <li>Christ-centered service and community impact</li>
                            <li>Unity, compassion, and strong family values</li>
                        </ul>
                    </div>

                    <div className="rounded-3xl bg-gradient-to-r from-red-900/30 to-slate-900 p-8 text-center">
                        <Link href="/ministries" className="inline-block rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition hover:bg-red-500">
                            View Our Ministries
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
