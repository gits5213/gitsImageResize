import type { ReactNode } from 'react'
import { Breadcrumbs } from '../components/seo/Breadcrumbs.tsx'

export function DraftNotice() {
  return (
    <aside
      role="note"
      data-testid="draft-notice"
      className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <strong>Draft for owner review.</strong> This page is a starting point for the
      website owner and their counsel. It is not legal advice, a certification, or a claim
      that every privacy law has been assessed. Review and complete it before production
      publication.
    </aside>
  )
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs current={title} />
      <div className="mt-6">
        <DraftNotice />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-8 space-y-8 leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </article>
  )
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{heading}</h2>
      {children}
    </section>
  )
}
