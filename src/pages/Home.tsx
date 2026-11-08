import { Download, Image as ImageIcon, Lock, Shield } from 'lucide-react'
import { ImageWorkspace } from '../components/image/ImageWorkspace.tsx'

const features = [
  {
    title: 'Free image resizing',
    body: 'Change pixel width and height, then download the result.',
    icon: ImageIcon,
  },
  {
    title: 'Browser-based processing',
    body: 'Resizing uses the canvas in your browser. There is no application upload API.',
    icon: Download,
  },
  {
    title: 'No registration required',
    body: 'Open the page and resize an image. There is no account and no login.',
    icon: Lock,
  },
  {
    title: 'Privacy-focused',
    body: 'Image contents are not written to app storage or sent to analytics.',
    icon: Shield,
  },
  {
    title: 'Mobile friendly',
    body: 'The workspace stacks on small screens and sits side by side on a desktop.',
    icon: ImageIcon,
  },
]

export function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:pt-16">
        <p className="text-sm font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-300">
          Private, in your browser
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Resize Images for Free. Pay It Forward.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Resize JPG, PNG, GIF, WebP, BMP, AVIF, ICO, SVG, TIFF, and HEIC images in your
          browser, then download PNG or JPG.
        </p>
        <ul className="mt-4 max-w-2xl space-y-1 text-slate-700 dark:text-slate-200">
          <li>No registration.</li>
          <li>No image uploads to application servers.</li>
          <li>No application-side image storage.</li>
        </ul>
        <a
          href="#workspace"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 font-semibold text-white shadow-sm hover:from-blue-700 hover:to-violet-700"
        >
          Upload Image
        </a>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        <ImageWorkspace />
      </div>

      <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold">Your Images. Your Privacy.</h2>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
            Your images are processed directly in your browser and are not uploaded to our
            servers. Hosting and optional analytics can still receive ordinary technical
            visitor information. That is described on the Privacy Policy page.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold">What you can do</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <feature.icon
                aria-hidden="true"
                className="text-blue-600 dark:text-blue-300"
              />
              <h3 className="mt-3 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {feature.body}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
