# Image Resizer Pro

Image Resizer Pro is a free, privacy-focused web app for resizing common image files in the browser. Version 1.0 does not upload image contents to an application server, does not require an account, and does not use a database.

The project folder is `gitsImageResize`. The name shown in the interface is Image Resizer Pro.

## Features

Version 1.0 includes:

- Browse and drag-and-drop upload for JPG, PNG, GIF, WebP, BMP, AVIF, ICO, SVG, TIFF, and HEIC
- Original filename, format, dimensions, and file size
- Pixel width and height controls, with the aspect ratio locked by default
- Original and resized previews
- Local download as PNG or JPG
- Reset dimensions and clear image
- Light and dark themes
- Privacy Policy, Terms of Use, Security & Privacy, Disclaimer, and Contact pages
- Optional Cloudflare Web Analytics that stays off until configured

Image compression and background editing are not part of this version. The image pipeline lives in `src/services` and `src/utils` so those features can be added later without replacing the upload and preview flow.

## Technology stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide icons
- Plus Jakarta Sans, self-hosted with Fontsource
- Vitest and React Testing Library
- Playwright
- ESLint and Prettier
- GitHub Actions and GitHub Pages

TypeScript 6.0 is used because the current `typescript-eslint` release does not accept TypeScript 7 yet. Strict type checking is enabled.

## Architecture

The browser does all image work:

1. The uploader checks the extension, MIME type, and file signature.
2. `createImageBitmap` decodes the file. A failed decode is treated as a corrupt file.
3. A canvas draws the requested pixel size. JPEG output is flattened onto white because JPEG has no alpha channel.
4. The result is checked against the requested dimensions, previewed with an object URL, and downloaded as a Blob.

React state holds the current image only in memory. Clear image, and unmounting the page, closes the bitmap and revokes object URLs. Images are not written to `localStorage`, `sessionStorage`, or IndexedDB. The theme choice is the only value stored locally.

There is no backend and no paid API.

## Folder structure

```text
gitsImageResize/
  .github/workflows/    CI and GitHub Pages deployment
  public/               favicon and the theme script
  src/components/       layout, controls, and previews
  src/pages/            routes, including the legal drafts
  src/hooks/            theme and resize state
  src/services/         canvas resize
  src/utils/            validation, names, and file-size text
  src/config/           site text, analytics, and the router base path
  tests/e2e/            Playwright specs and generated fixtures
```

## Prerequisites

- Node.js 22 or newer
- npm

## Local installation

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` only if you want to set a site owner, contact email, repository URL, or analytics token. The app runs with those values empty.

## Local development

```bash
npm run dev
```

Open the URL Vite prints. The dev server does not use the production Content Security Policy meta tag, so hot reload can run.

## Running unit tests

```bash
npm test
```

## Running Playwright tests

```bash
npm run test:e2e
```

That command builds the app, then serves the build and runs Chromium. Fixtures are generated in `tests/fixtures/generated` and are not committed. The HTML report is written to `playwright-report/`.

## Production build

```bash
npm run build
npm run preview
```

The build copies `index.html` to `404.html` so a GitHub Pages project site can refresh a client-side route such as `/privacy` without a broken deep link. For a project site, set the base path before building:

```bash
VITE_BASE_PATH=/your-repository-name/ npm run build
```

Leave `VITE_BASE_PATH` unset, or set it to `/`, for local preview and for a user site published from a `username.github.io` repository. Do not hardcode a GitHub username in the source.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy.yml` is ready. It has not been run from this workspace, and the site is not deployed until you connect a repository and enable Pages.

1. Create a GitHub repository and push this project. The default branch can be `main` or `master`.
2. In the repository settings, open **Pages** and set the source to **GitHub Actions**.
3. Optional public configuration uses repository **Variables**, not secrets. The beacon token is a public site token. Do not add a Cloudflare account API token.
   - `VITE_ANALYTICS_ENABLED` as `true` or `false`
   - `VITE_CF_BEACON_TOKEN`
   - `VITE_SITE_OWNER`
   - `VITE_CONTACT_EMAIL`
   - `VITE_GITHUB_REPO_URL` as an `https://github.com/...` URL
4. Push to `main` or `master`, or run the **Deploy GitHub Pages** workflow manually.
5. The workflow runs lint, formatting, typecheck, and unit tests before it uploads the site. A failed check stops deployment.
6. For a project repository named `gitsImageResize`, the published path is `https://<username>.github.io/gitsImageResize/`. The workflow sets that base path from the repository name. A repository named `*.github.io` is published at `/`.

Later updates deploy when you push to `main` or `master`.

## Cloudflare Analytics setup

1. In Cloudflare, add the site to Web Analytics and copy the site token. Cloudflare documents this at [Web Analytics](https://developers.cloudflare.com/web-analytics/).
2. Set `VITE_ANALYTICS_ENABLED=true` and `VITE_CF_BEACON_TOKEN` to that public token.
3. Rebuild. The page loads `https://static.cloudflareinsights.com/beacon.min.js` only when both values are present.
4. Use the Cloudflare dashboard for page views, visits, date ranges, countries, top pages, and referrers. Visits are Cloudflare’s privacy-preserving count, not a list of identified people. The dashboard is not embedded on this site, and visitor totals are not shown publicly.

With analytics left off, the beacon is not added and resizing still works. The beacon is not given images, filenames, dimensions, or downloads. This app does not add advertising cookies or its own user identifiers.

Whether your audience needs a consent banner is a legal question for the site operator. One is not included just to fill the layout.

## Privacy architecture

Image bytes stay in the tab that opened them. The page does not post them anywhere. GitHub Pages can still record technical request data, including IP addresses, for hosting and security. Optional Cloudflare analytics can record page usage when you enable it. The Privacy Policy separates those three cases.

The app does not claim that a browser or operating system never caches temporary data, and it does not delete files after the browser downloads them.

## Security considerations

- Production hosting is intended to be HTTPS on GitHub Pages.
- There is no upload API, database, or application secret.
- Files are checked before decode, and filenames are rendered as text.
- Downloads use a generated name with path characters and markup removed.
- External links use `rel="noopener noreferrer"`.
- Production builds add a Content Security Policy **meta** tag. GitHub Pages does not let this repository set HTTP headers such as HSTS or `frame-ancestors`, so those headers are not claimed.
- `frame-ancestors` is omitted from the meta policy because browsers do not honor it there.

## Accessibility

The interface uses semantic regions, labeled controls, a skip link, visible focus, text with icons for errors, and an `aria-live` status message. Motion is reduced when the visitor asks for that. The target is WCAG 2.2 AA. That is a design target, not a formal audit or certification.

## Known limitations

- Output is capped at 16 million pixels, and each browser also has its own canvas limit. The page probes the longest side it can allocate, up to 16,384 pixels.
- Files larger than 50 MB are refused.
- Enlarging an image does not add detail.
- JPEG output cannot keep transparency.
- Very large images can still take a moment to decode.
- AVIF, TIFF, HEIC, and SVG open only when the browser can decode them. An animated GIF uses its first frame.
- Downloads are PNG or JPG.
- Legal pages are drafts.

## Troubleshooting

- If `npm run test:e2e` cannot find a browser, run `npx playwright install chromium`.
- Playwright is pinned to 1.55.1 because newer Playwright releases do not ship Chromium for macOS 13.
- If a deep link 404s on GitHub Pages, confirm the deploy workflow ran and that Pages is set to GitHub Actions. The build must contain `404.html`.
- If styles or scripts 404 on Pages, rebuild with `VITE_BASE_PATH` set to `/your-repository-name/`.
- If resize fails, try a smaller size or PNG output. The on-screen message is intentionally short.

## Future roadmap

- Version 2.0: compression toward a target file size, with a before-and-after size comparison.
- Version 3.0: background removal and replacement, including transparency and solid colors.

Those controls are not in the Version 1.0 interface.

## Contributing

Open an issue or pull request on the repository you publish. Run `npm run lint`, `npm run typecheck`, and `npm test` before asking for review. Keep image processing in the browser.

## License

Released under the [MIT License](LICENSE).

The legal pages are drafts for the site operator to review. They are not legal advice, and this project does not claim that any privacy law has been certified or fully met.
