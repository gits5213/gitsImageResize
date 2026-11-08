import { siteConfig } from '../config/site.ts'
import { LegalPage, LegalSection } from './LegalPage.tsx'

export function Disclaimer() {
  return (
    <LegalPage title="Disclaimer">
      <LegalSection heading="As-available service">
        <p>
          {siteConfig.name} is offered as available. Maintenance, GitHub Pages outages,
          browser changes, or removal of the site can interrupt it. There is no promise of
          uninterrupted or error-free operation.
        </p>
      </LegalSection>

      <LegalSection heading="Image processing limits">
        <p>
          Resizing changes pixel dimensions. It does not recover detail that was not in
          the original, and a larger size does not increase the true resolution of the
          source. Turning off the aspect-ratio lock can distort the picture. Saving as
          JPEG flattens transparency onto white and uses lossy compression, so the
          downloaded file can look different from the original. Very large files or
          dimensions can fail when the browser runs out of memory or rejects the canvas
          size.
        </p>
      </LegalSection>

      <LegalSection heading="Browser differences">
        <p>
          Browsers do not all support the same maximum image size, memory budget, or
          output encoder. A file that resizes in one browser may fail in another. AVIF,
          TIFF, HEIC, and SVG open only when this browser can decode them. An animated GIF
          uses its first frame. Downloads are PNG or JPG.
        </p>
      </LegalSection>

      <LegalSection heading="Downloaded files">
        <p>
          You decide where a download is saved and when it is deleted. The application
          does not manage your downloads folder and does not claim to erase files from
          your device.
        </p>
      </LegalSection>

      <LegalSection heading="No professional advice">
        <p>
          The tool and the draft legal pages are not legal, security, or
          professional-imaging advice. The owner should have the legal pages reviewed
          before treating them as published policy. Nothing on the site is a certification
          of privacy-law compliance.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
