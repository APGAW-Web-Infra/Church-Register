import { Head, Link } from '@inertiajs/react';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy - APGA Worldwide" />
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-red-600 dark:text-red-400">APGA Worldwide</Link>
                        <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-red-600">Back to Home</Link>
                    </div>
                </nav>
                <div className="container mx-auto px-6 py-16 max-w-4xl">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Introduction</h2>
                            <p>APGA Worldwide respects your privacy and is committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Information We Collect</h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Personal identification information (name, email, contact details)</li>
                                <li>Educational and professional background</li>
                                <li>Business and financial information</li>
                                <li>Usage data and analytics</li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">How We Use Your Data</h2>
                            <p>We use collected data to provide and improve our services, process applications, and communicate program updates.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Data Protection</h2>
                            <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or misuse.</p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
