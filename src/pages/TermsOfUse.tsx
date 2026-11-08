import { safeMailto, siteConfig } from '../config/site.ts'
import { LegalPage, LegalSection } from './LegalPage.tsx'

export function TermsOfUse() {
  const mailto = safeMailto(siteConfig.contactEmail)

  return (
    <LegalPage title="Terms of Use">
      <LegalSection heading="Acceptance">
        <p>
          These draft terms describe use of {siteConfig.name}. Proposed date:{' '}
          {siteConfig.draftDate}. They are not in force until the website owner reviews
          them with qualified counsel and publishes a final version. If you use the site
          after that publication, the published terms are the ones that apply.
        </p>
      </LegalSection>

      <LegalSection heading="The service">
        <p>
          The site lets you resize JPEG, PNG, and WebP images in your browser and download
          the result. It is free to use in this version. There is no account. Availability
          depends on GitHub Pages, your browser, and your device.
        </p>
      </LegalSection>

      <LegalSection heading="Permitted use">
        <p>
          You may use the tool to resize images you are allowed to modify, for lawful
          personal, educational, or commercial work of your own. You keep any rights you
          already have in those images. The site does not claim ownership of images you
          select.
        </p>
      </LegalSection>

      <LegalSection heading="Prohibited activities">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Using the site to infringe someone else's copyright, privacy, or other rights.
          </li>
          <li>
            Attempting to break, overload, or interfere with GitHub Pages or this site.
          </li>
          <li>Introducing malware or disguising harmful files as images.</li>
          <li>
            Misrepresenting the tool as an official product of GitHub, Cloudflare, or
            another party.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Your responsibilities">
        <p>
          You are responsible for checking that you have the rights needed to open,
          resize, and download an image. You are also responsible for what you do with the
          file after download, including where you store it and who you share it with.
        </p>
      </LegalSection>

      <LegalSection heading="Intellectual property">
        <p>
          The application source code is offered under the license in the repository.
          Third-party libraries remain under their own licenses. These terms do not
          transfer ownership of your images to the site operator.
        </p>
      </LegalSection>

      <LegalSection heading="Availability">
        <p>
          The service is provided on an as-available basis. It may be interrupted,
          changed, or removed. A resize can fail because of browser limits, memory, or an
          unsupported file.
        </p>
      </LegalSection>

      <LegalSection heading="Disclaimer of warranties">
        <p>
          The site is provided "as is" and "as available". To the extent the law that
          applies to the operator allows, the operator disclaims warranties of
          merchantability, fitness for a particular purpose, and non-infringement. Image
          quality, exact file size, and uninterrupted operation are not guaranteed. Some
          jurisdictions do not allow certain disclaimers, so parts of this section may not
          apply to you. Counsel should adapt it.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the extent permitted by applicable law, the operator is not liable for
          indirect, incidental, special, consequential, or punitive damages, or for loss
          of data, profits, or goodwill, arising from use of the site. This draft does not
          set a dollar cap. The owner and counsel should decide whether a cap is
          appropriate and enforceable before publication.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          The owner may update these terms by publishing a new version on this page. The
          owner should change the effective date when that happens.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          {mailto ? (
            <a className="underline" href={mailto}>
              {siteConfig.contactEmail}
            </a>
          ) : (
            'A contact email has not been published yet.'
          )}
        </p>
      </LegalSection>

      <LegalSection heading="Questions the owner still needs to resolve">
        <ul className="list-disc space-y-2 pl-5">
          <li>Governing law and venue.</li>
          <li>The legal entity that offers the site.</li>
          <li>Any age requirement the owner wants to state.</li>
          <li>Whether a liability cap should be included.</li>
          <li>Whether a copyright-notice process is needed.</li>
        </ul>
      </LegalSection>
    </LegalPage>
  )
}
