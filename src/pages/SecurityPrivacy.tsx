import { LegalPage, LegalSection } from './LegalPage.tsx'

const steps = [
  'You select an image from your device, or you drop one onto the page.',
  'Your browser reads the file and checks that it looks like a supported image.',
  'Your browser draws a resized copy locally at the pixel size you enter.',
  'You preview the resized result next to the original.',
  'You download the new file through your browser. The download is not sent to an application server.',
  'You clear the image, or you leave the page. The page releases the object URLs and image data it was holding.',
]

export function SecurityPrivacy() {
  return (
    <LegalPage title="Security & Privacy">
      <LegalSection heading="How resizing works">
        <ol className="list-decimal space-y-2 pl-5">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </LegalSection>

      <LegalSection heading="What the application does not do">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            It does not upload the image to an application server or to cloud image
            storage.
          </li>
          <li>It does not keep an image database.</li>
          <li>
            It does not put image contents, filenames, or dimensions into analytics.
          </li>
          <li>
            It does not store the image in localStorage, sessionStorage, or IndexedDB.
          </li>
          <li>
            It does not run the contents of a file as a script, and it does not insert
            filenames as HTML.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="What remains outside the application's control">
        <p>
          The page can release the copies it created. It cannot promise that the browser,
          the operating system, or a download folder will forget the file. GitHub Pages
          may record technical request data, including IP addresses, for hosting and
          security. That is separate from the image-processing code.
        </p>
        <p>
          If the owner enables Cloudflare Web Analytics, Cloudflare receives website usage
          information such as page views and approximate visits. The beacon is omitted
          when analytics is not configured. The analytics dashboard stays in the owner's
          Cloudflare account and is not shown on this site. The footer visit total is a
          separate public counter and does not include image contents.
        </p>
      </LegalSection>

      <LegalSection heading="Controls in this version">
        <p>
          Files are checked for a supported type and a matching file signature before
          decode. Dimensions must be positive whole numbers inside a practical size limit
          and the limit this browser reports for a canvas. Production builds include a
          Content Security Policy meta tag. GitHub Pages does not let this repository set
          HTTP response headers such as HSTS, so those headers are not claimed to be
          present. The site is intended to be served over HTTPS by GitHub Pages.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
