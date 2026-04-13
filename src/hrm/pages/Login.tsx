import React from 'react';

/* ============================================
 * Login Page
 * Converted from: Angular login.component.ts + login.component.html
 * 
 * Angular → React conversions:
 *  - (click) → onClick
 *  - inject(ToastService) → console.log (placeholder)
 *  - Standalone page (no layout wrapper)
 * ============================================ */

export const Login: React.FC = () => {
    const loginWithGoogle = () => {
        console.log('Login with Google');
    };

    const loginWithApple = () => {
        console.log('Login with Apple');
    };

    const loginWithMicrosoft = () => {
        console.log('Login with Microsoft');
    };

    const loginWithPasskey = () => {
        console.log('Login with Passkey');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="card animate-fade-in">
                    {/* Logo and Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="material-symbols-outlined text-3xl text-white">business</span>
                        </div>
                        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Welcome Back</h1>
                        <p className="text-secondary-500 text-sm">Sign in to access your employee portal</p>
                    </div>

                    {/* Authentication Options */}
                    <div className="space-y-3">
                        {/* Google Login */}
                        <button
                            onClick={loginWithGoogle}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-secondary-200 rounded-xl hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 group"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-sm font-semibold text-secondary-700 group-hover:text-secondary-900">
                                Continue with Google
                            </span>
                        </button>

                        {/* Apple Login */}
                        <button
                            onClick={loginWithApple}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black border-2 border-black rounded-xl hover:bg-gray-900 transition-all duration-200 group"
                        >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            <span className="text-sm font-semibold text-white">Continue with Apple</span>
                        </button>

                        {/* Microsoft Login */}
                        <button
                            onClick={loginWithMicrosoft}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-secondary-200 rounded-xl hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 group"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#F25022" d="M1 1h10v10H1z" />
                                <path fill="#00A4EF" d="M13 1h10v10H13z" />
                                <path fill="#7FBA00" d="M1 13h10v10H1z" />
                                <path fill="#FFB900" d="M13 13h10v10H13z" />
                            </svg>
                            <span className="text-sm font-semibold text-secondary-700 group-hover:text-secondary-900">
                                Continue with Microsoft
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-secondary-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-4 text-secondary-500 font-semibold">Or</span>
                            </div>
                        </div>

                        {/* Passkey Login */}
                        <button
                            onClick={loginWithPasskey}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                        >
                            <span className="material-symbols-outlined text-xl">passkey</span>
                            <span className="text-sm font-semibold">Sign in with Passkey</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-secondary-100">
                        <p className="text-center text-xs text-secondary-500">
                            By continuing, you agree to our{' '}
                            <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-secondary-600">
                        Need help?{' '}
                        <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};
