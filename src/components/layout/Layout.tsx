import { Outlet } from 'react-router'
import { DocumentHead } from '../seo/DocumentHead.tsx'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <DocumentHead />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow dark:focus:bg-slate-900"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
