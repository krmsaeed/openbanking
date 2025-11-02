import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex items-center justify-center bg-gradient-to-br px-4 py-16">
            <div className="w-full max-w-2xl rounded-xl bg-white p-8 text-center shadow-lg">
                <h1 className="mb-4 text-5xl font-extrabold text-gray-900">404</h1>
                <h2 className="mb-3 text-2xl font-semibold text-gray-800">صفحه پیدا نشد</h2>
                <p className="mb-6 text-gray-600">
                    متأسفیم، صفحه‌ای که دنبال آن بودید وجود ندارد یا ممکن است منتقل شده باشد.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <Link
                        href={'/'}
                        className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        بازگشت به خانه
                    </Link>

                    <Link
                        href={'/'}
                        className="inline-block rounded-md border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                        ورود به سیستم
                    </Link>
                </div>
            </div>
        </div>
    );
}
