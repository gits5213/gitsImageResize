import { Link } from 'react-router'
import { Breadcrumbs } from '../components/seo/Breadcrumbs.tsx'

export function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Breadcrumbs current="Page not found" />
      <h1 className="mt-6 text-3xl font-semibold text-slate-950 dark:text-white">
        Page not found
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        That address is not part of Image Resizer Pro.
      </p>
      <Link
        className="mt-6 inline-flex font-semibold text-blue-700 underline dark:text-blue-300"
        to="/"
      >
        Back to home
      </Link>
    </div>
  )
}
