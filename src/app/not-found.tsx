import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-sm w-full text-center space-y-3">
        <h1 className="text-lg font-bold text-gray-900">Page not found</h1>
        <p className="text-sm text-gray-500">The page you requested does not exist.</p>
        <Link className="btn-primary justify-center w-full" href="/">
          Back home
        </Link>
      </div>
    </div>
  )
}
