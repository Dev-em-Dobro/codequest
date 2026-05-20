import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold leading-none">!</span>
                    <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
                </div>

                <p className="mt-4 text-sm text-gray-600">Did you forget to add the page to the router?</p>

                <Link href="/" className="mt-6 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                    Back to home
                </Link>
            </div>
        </main>
    );
}
