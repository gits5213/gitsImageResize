import { siteConfig } from '../config/site.ts'

export function About() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">About {siteConfig.name}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-slate-700 dark:text-slate-300">
        <p>
          {siteConfig.name} version {siteConfig.version} is a free browser tool for
          changing the pixel dimensions of common image files. Downloads are PNG or JPG.
          It is meant for anyone who wants a straightforward resize without creating an
          account.
        </p>
        <p>
          The resizer reads the file you select, draws it to a canvas at the size you
          request, and lets you download the new file. Those steps run on your device. The
          application does not include an upload API, a database, or image storage.
        </p>
        <p>
          Making an image larger does not recreate detail that was not in the original
          file. Changing the aspect ratio can stretch the picture. JPEG output does not
          keep transparency.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-slate-900 dark:text-white">
          This version
        </h2>
        <p>
          Version 1.0 covers upload, pixel resizing, aspect-ratio lock, preview, download,
          reset, and clear. Compression targets and background editing are planned as
          later versions and are not part of this release.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-slate-900 dark:text-white">
          What this site does not promise
        </h2>
        <p>
          Browsers and operating systems may keep temporary files or download copies
          outside this application. The site is hosted on GitHub Pages, so GitHub can
          process technical visitor information for hosting and security. Optional
          Cloudflare Web Analytics, when the owner turns it on, measures page traffic and
          does not receive image contents.
        </p>
      </div>
    </article>
  )
}
