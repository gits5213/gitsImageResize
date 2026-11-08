import { Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { readVisitorCount } from '../../services/visitorCount.ts'

export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    void readVisitorCount().then((value) => {
      if (active) setCount(value)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <p
      className="inline-flex items-center gap-2 self-end rounded-full border border-slate-200 bg-slate-50 py-1 pr-3 pl-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      data-testid="visitor-count"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-blue-500">
        <Users aria-hidden="true" size={14} />
      </span>
      <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
        Visitors
      </span>
      <span className="min-w-4 text-sm font-semibold text-slate-900 tabular-nums dark:text-white">
        {count === null ? '—' : count.toLocaleString()}
      </span>
    </p>
  )
}
