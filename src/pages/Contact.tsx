import { safeGithubUrl, safeMailto, siteConfig } from '../config/site.ts'
import { LegalPage, LegalSection } from './LegalPage.tsx'

export function Contact() {
  const mailto = safeMailto(siteConfig.contactEmail)
  const github = safeGithubUrl(siteConfig.githubRepoUrl)

  return (
    <LegalPage title="Contact">
      <p>
        This page does not collect messages. There is no contact form, because the site
        has no backend to receive one.
      </p>

      <LegalSection heading="Website operator">
        <p>
          {siteConfig.ownerName ||
            'The operator name has not been published. Set VITE_SITE_OWNER before launch.'}
        </p>
      </LegalSection>

      <LegalSection heading="Email">
        {mailto ? (
          <p>
            <a
              className="font-medium text-blue-700 underline dark:text-blue-300"
              href={mailto}
            >
              {siteConfig.contactEmail}
            </a>
          </p>
        ) : (
          <p>
            No contact email has been published. Set VITE_CONTACT_EMAIL to a real address
            before launch. An invalid value is not turned into a link.
          </p>
        )}
      </LegalSection>

      <LegalSection heading="Source code">
        {github ? (
          <p>
            <a
              className="font-medium text-blue-700 underline dark:text-blue-300"
              href={github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Repository
            </a>
          </p>
        ) : (
          <p>
            The GitHub repository URL has not been published. Set VITE_GITHUB_REPO_URL to
            an https://github.com link.
          </p>
        )}
      </LegalSection>
    </LegalPage>
  )
}
