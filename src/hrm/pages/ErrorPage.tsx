import React from 'react';
import { useNavigate } from 'react-router-dom';

/* ============================================
 * Error Page
 * Converted from: Angular error.component.ts + error.component.html
 * ============================================ */

export const ErrorPage: React.FC = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);
    const goHome = () => navigate('/hrm/dashboard');

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-secondary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="card text-center animate-fade-in">
                    {/* Error Icon */}
                    <div className="mb-6">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent-rose/20 to-accent-rose/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-accent-rose">error</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">Oops!</h1>
                    <h2 className="text-xl md:text-2xl font-semibold text-secondary-700 mb-4">Something went wrong</h2>

                    <p className="text-secondary-600 mb-8 max-w-md mx-auto">
                        We couldn't find the page you're looking for, or an error has occurred.
                        The page might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-lg mb-8">
                        <span className="material-symbols-outlined text-secondary-500">info</span>
                        <span className="text-sm font-semibold text-secondary-700">Error Code: 404</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <button onClick={goBack} className="btn-secondary w-full sm:w-auto">
                            <span className="material-symbols-outlined text-base mr-2">arrow_back</span>
                            Go Back
                        </button>
                        <button onClick={goHome} className="btn-primary w-full sm:w-auto">
                            <span className="material-symbols-outlined text-base mr-2">home</span>
                            Go to Dashboard
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-secondary-200">
                        <p className="text-sm text-secondary-600 mb-4">Still having trouble? Here are some helpful links:</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-sm">help</span>
                                Help Center
                            </a>
                            <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-sm">support</span>
                                Contact Support
                            </a>
                            <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-sm">description</span>
                                Documentation
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600 flex-shrink-0">lightbulb</span>
                        <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Quick Tips</p>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Check the URL for any typos</li>
                                <li>• Try refreshing the page</li>
                                <li>• Clear your browser cache and cookies</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
