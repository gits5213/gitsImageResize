import { Link } from 'react-router'

export function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-slate-400">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            to="/"
            className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
          >
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-slate-700 dark:text-slate-200">
          {current}
        </li>
      </ol>
    </nav>
  )
}
