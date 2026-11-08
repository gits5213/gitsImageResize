import { Menu, Moon, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router'
import { siteConfig } from '../../config/site.ts'
import { useTheme } from '../../hooks/useTheme.ts'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/resize', label: 'Resize Image', end: false },
  { to: '/about', label: 'About', end: false },
]

export function Header() {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <NavLink
          to="/"
          aria-label={`${siteConfig.companyName}, ${siteConfig.companyLocation}`}
          className="flex min-w-0 items-center gap-2 rounded-xl sm:gap-3"
          end
        >
          <img
            src={`${import.meta.env.BASE_URL}gits-logo.png`}
            alt=""
            width={720}
            height={519}
            className="h-11 w-auto shrink-0 object-contain"
          />
          <span className="min-w-0 leading-tight">
            <span className="flex flex-wrap gap-x-2 text-[13px] font-bold tracking-wide text-[#003366] uppercase dark:text-blue-100">
              {siteConfig.companyName.split(' ').map((word) => (
                <span key={word}>{word}</span>
              ))}
            </span>
            <span className="mt-0.5 hidden text-[11px] font-medium tracking-wide text-slate-500 uppercase sm:block dark:text-slate-400">
              {siteConfig.companyLocation}
            </span>
          </span>
        </NavLink>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          data-testid="theme-toggle"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 md:ml-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label={
            nextTheme === 'dark' ? 'Switch to dark mode' : 'Switch to light mode'
          }
          onClick={toggle}
        >
          {theme === 'dark' ? (
            <Sun aria-hidden="true" size={18} />
          ) : (
            <Moon aria-hidden="true" size={18} />
          )}
        </button>

        <button
          type="button"
          data-testid="nav-toggle"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden dark:border-slate-700 dark:text-slate-200"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X aria-hidden="true" size={18} />
          ) : (
            <Menu aria-hidden="true" size={18} />
          )}
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-navigation"
          className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800"
          aria-label="Mobile"
        >
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-3 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-200'
                        : 'text-slate-700 dark:text-slate-200'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
