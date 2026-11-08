import { seoIdentity } from './seo.ts'

function readEnv(value: string | undefined): string {
  return (value ?? '').trim()
}

export const siteConfig = {
  name: seoIdentity.name,
  companyName: seoIdentity.companyName,
  companyLegalName: seoIdentity.companyLegalName,
  companyLocation: seoIdentity.companyLocation,
  companyUrl: seoIdentity.companyUrl,
  version: '1.0.0',
  ownerName: readEnv(import.meta.env.VITE_SITE_OWNER),
  contactEmail: readEnv(import.meta.env.VITE_CONTACT_EMAIL),
  githubRepoUrl:
    readEnv(import.meta.env.VITE_GITHUB_REPO_URL) || seoIdentity.defaultGithubRepoUrl,
  draftDate: '7 November 2026',
}

export function safeMailto(email: string): string | null {
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) return null
  return `mailto:${email}`
}

export function safeGithubUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com') return null
    return parsed.toString()
  } catch {
    return null
  }
}
