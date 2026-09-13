import { Head, Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service - APGA Worldwide" />
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-red-600 dark:text-red-400">APGA Worldwide</Link>
                        <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-red-600">Back to Home</Link>
                    </div>
                </nav>
                <div className="container mx-auto px-6 py-16 max-w-4xl">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Acceptance of Terms</h2>
                            <p>By accessing and using the APGA Worldwide platform, you agree to comply with these Terms of Service. If you do not agree with any part, please do not use our services.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">User Responsibilities</h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Provide accurate and complete information during registration</li>
                                <li>Maintain confidentiality of your account credentials</li>
                                <li>Comply with all applicable laws and regulations</li>
                                <li>Use the platform only for authorized purposes</li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Program Terms</h2>
                            <p>Participation in APGA Worldwide programs is subject to specific terms, conditions, and eligibility requirements. All participants must comply with program guidelines and regulations.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Limitation of Liability</h2>
                            <p>APGA Worldwide provides services on an "as-is" basis. We are not liable for indirect, incidental, or consequential damages arising from platform use.</p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
