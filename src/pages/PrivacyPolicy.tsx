import { safeGithubUrl, safeMailto, siteConfig } from '../config/site.ts'
import { LegalPage, LegalSection } from './LegalPage.tsx'

export function PrivacyPolicy() {
  const mailto = safeMailto(siteConfig.contactEmail)
  const github = safeGithubUrl(siteConfig.githubRepoUrl)
  const owner =
    siteConfig.ownerName || 'The website operator has not published a name yet.'

  return (
    <LegalPage title="Privacy Policy">
      <LegalSection heading="Website">
        <p>
          This draft describes {siteConfig.name}, a static website intended to be hosted
          on GitHub Pages. Proposed effective date: {siteConfig.draftDate}. The owner must
          confirm the effective date before publication.
        </p>
        <p>Operator: {owner}</p>
      </LegalSection>

      <LegalSection heading="Information this application processes">
        <p>
          When you choose an image, the page reads that file in your browser so it can
          show the original size, draw a resized preview, and create a download. The
          application is built not to upload image contents, filenames, or image metadata
          to an application server, a database, cloud image storage, or the analytics
          beacon.
        </p>
        <p>
          The page keeps the image in temporary browser memory while you are using it.
          Clear Image drops the references this page holds and revokes the temporary
          object URLs it created. Leaving the page does the same cleanup when the
          component unmounts. This policy does not claim that a browser or operating
          system never caches temporary information, and it does not claim that a file you
          downloaded is deleted automatically.
        </p>
        <p>
          The application does not write images to localStorage, sessionStorage, or
          IndexedDB. It may store your light or dark theme choice in localStorage. That
          value is a display preference, not an image.
        </p>
      </LegalSection>

      <LegalSection heading="Hosting">
        <p>
          GitHub Pages hosts the site files. GitHub may process technical visitor
          information, including IP addresses, browser details, and request logs, for
          hosting, security, and abuse prevention. That processing is separate from image
          resizing and is controlled by GitHub, not by this page's image code.
        </p>
        <p>
          GitHub's current privacy statement is published at{' '}
          <a
            className="underline"
            href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs.github.com
          </a>
          . This site does not claim that no visitor data is processed.
        </p>
      </LegalSection>

      <LegalSection heading="Analytics">
        <p>
          Visitor measurement is optional. If the owner sets the public Cloudflare Web
          Analytics site token and turns analytics on, the page loads Cloudflare's beacon.
          If that token is missing or analytics is disabled, the beacon is not added and
          the resizer still works.
        </p>
        <p>
          Cloudflare Web Analytics is designed to report aggregated traffic in a private
          dashboard for the account owner. The dashboard is not embedded on this website.
          The footer shows a separate public visit total. That request sends only the
          counter name, not images, filenames, or dimensions. This integration does not
          send uploaded images, image contents, filenames, dimensions, or downloaded
          files. It is not an advertising cookie, a behavioral advertising profile, or a
          custom personal identifier created by this application.
        </p>
        <p>
          Metrics the owner can review in Cloudflare's dashboard, when analytics is
          enabled, include page views, visits (a privacy-preserving approximate count
          rather than an exact identified user list), traffic over a selected range such
          as a day, week, or month, country, popular pages, and referral sources. The
          owner should rely on Cloudflare's current documentation for the exact fields
          available. This site does not invent extra metrics.
        </p>
        <p>
          Cloudflare states that Web Analytics does not use cookies for this product. The
          owner should confirm that description against the current Cloudflare
          documentation before relying on it. Consent requirements depend on the owner's
          audience, the final configuration, and the laws that apply. This draft does not
          add a cookie banner, because the default build does not run the beacon and the
          beacon is not an advertising cookie.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies and similar storage">
        <p>
          The resizer itself does not set advertising or profiling cookies. Theme
          preference uses localStorage. GitHub Pages and, when enabled, Cloudflare may use
          their own technical mechanisms. Review their notices for those details.
        </p>
      </LegalSection>

      <LegalSection heading="Retention">
        <p>
          Image data held by this page is released when you clear the image or leave the
          page. The theme preference remains until you clear site data or change it.
          Retention of hosting logs and analytics, if analytics is enabled, is determined
          by GitHub and Cloudflare.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          The tool is a general-audience utility and is not designed to be directed to
          children. It does not offer accounts. It is not intended to collect personal
          information from children. Hosting logs, if any, are processed by GitHub.
          Whether the Children's Online Privacy Protection Act applies depends on how the
          site is actually offered. The owner needs to decide that question.
        </p>
      </LegalSection>

      <LegalSection heading="International visitors">
        <p>
          People can open the site from different countries. GitHub and Cloudflare may
          process technical data in the United States and other countries. The GDPR, UK
          GDPR, and similar laws may apply to the operator in some situations. This draft
          does not decide that they apply, and it does not state a lawful basis.
        </p>
      </LegalSection>

      <LegalSection heading="Privacy rights">
        <p>
          Access, deletion, correction, and similar rights depend on who operates the site
          and where the person lives. This application does not keep an account or an
          image database, so there is often no image record here to provide or delete.
          Hosting and analytics records, when they exist, are held by GitHub and
          Cloudflare under their own processes.
        </p>
        <p>
          This integration is not designed to sell personal information or to share it for
          cross-context behavioral advertising. A California "sale" or "share" analysis
          still belongs to the operator if the CCPA/CPRA applies. This page does not claim
          official compliance or a certification.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          {mailto ? (
            <a className="underline" href={mailto}>
              {siteConfig.contactEmail}
            </a>
          ) : (
            'A contact email has not been published yet. Add VITE_CONTACT_EMAIL before relying on this page.'
          )}
        </p>
        {github ? (
          <p>
            Source repository:{' '}
            <a
              className="underline"
              href={github}
              target="_blank"
              rel="noopener noreferrer"
            >
              {github}
            </a>
          </p>
        ) : null}
      </LegalSection>

      <LegalSection heading="Updates">
        <p>
          The owner may replace this draft. The page should show a new effective date when
          that happens. Continuing to use the site after an updated policy is published is
          not, by itself, a substitute for any consent a law actually requires.
        </p>
      </LegalSection>

      <LegalSection heading="Questions the owner still needs to resolve">
        <ul className="list-disc space-y-2 pl-5">
          <li>The legal name, address, and country of the operator.</li>
          <li>
            Whether GDPR, UK GDPR, CCPA/CPRA, or other laws apply to this deployment.
          </li>
          <li>The lawful basis for hosting logs and for analytics if it is enabled.</li>
          <li>Whether a consent banner is required for the chosen audience.</li>
          <li>Whether the site is directed to children.</li>
          <li>Who will answer privacy requests, and within which time limits.</li>
        </ul>
      </LegalSection>
    </LegalPage>
  )
}
