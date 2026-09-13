import { Head, Link } from '@inertiajs/react';

export default function Governance() {
    return (
        <>
            <Head title="Governance - APGA Worldwide" />

            <div className="min-h-screen bg-white dark:bg-gray-900">
                <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-red-600 dark:text-red-400">
                            APGA Worldwide
                        </Link>
                        <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-red-600">
                            Back to Home
                        </Link>
                    </div>
                </nav>

                <div className="container mx-auto px-6 py-16 max-w-4xl">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Governance & Committees</h1>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Church Governance Structure</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                APGA Worldwide operates through a structured governance framework designed to ensure spiritual accountability, faithful stewardship, and effective ministry leadership.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Key Committees</h2>
                            <div className="space-y-4">
                                {['Pastoral Care', 'Discipleship & Education', 'Worship & Prayer', 'Community Outreach', 'Administration'].map((committee, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{committee}</h3>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Governance Principles</h2>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                                <li>Inclusive representation across all geopolitical zones</li>
                                <li>Transparent decision-making processes</li>
                                <li>Accountability to constituents</li>
                                <li>Merit-based leadership selection</li>
                                <li>Regular engagement with stakeholders</li>
                            </ul>
                        </section>
                    </div>

                    <div className="mt-12 bg-gradient-to-r from-red-50 to-red-50 dark:from-red-950 dark:to-red-950 rounded-lg p-8 text-center">
                        <Link href="/leadership" className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Meet Our Leaders
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
