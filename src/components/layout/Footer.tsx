import { NavLink } from 'react-router'
import { safeGithubUrl, siteConfig } from '../../config/site.ts'

const links = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Use' },
  { to: '/security', label: 'Security & Privacy' },
  { to: '/disclaimer', label: 'Disclaimer' },
  { to: '/contact', label: 'Contact' },
]

export function Footer() {
  const githubUrl = safeGithubUrl(siteConfig.githubRepoUrl)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {siteConfig.companyName}
          </p>
          <p className="mt-1">
            <a
              href={siteConfig.companyUrl}
              className="text-sm text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              gitsuniversity.org
            </a>
          </p>
          <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">
            Resize images in your browser. Version {siteConfig.version} does not upload
            image contents to an application server.
          </p>
        </div>
        <nav
          aria-label="Legal and contact"
          className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
            >
              {link.label}
            </NavLink>
          ))}
          {githubUrl ? (
            <a
              href={githubUrl}
              className="text-slate-600 underline-offset-4 hover:underline dark:text-slate-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Repository
            </a>
          ) : (
            <span
              className="text-slate-500 dark:text-slate-400"
              data-testid="github-unconfigured"
            >
              GitHub Repository not configured
            </span>
          )}
        </nav>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800">
        <p className="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
          © {year} {siteConfig.companyLegalName} All rights reserved.
        </p>
      </div>
    </footer>
  )
}
