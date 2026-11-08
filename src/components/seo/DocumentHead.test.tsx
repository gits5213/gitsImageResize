import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { DocumentHead } from './DocumentHead.tsx'
import { NOT_FOUND_PAGE, pageForPath } from '../../config/seo.ts'

const markers = [
  'data-seo-description',
  'data-seo-robots',
  'data-seo-og-title',
  'data-seo-og-description',
  'data-seo-og-url',
  'data-seo-og-site-name',
  'data-seo-twitter-title',
  'data-seo-twitter-description',
  'data-seo-canonical',
]

afterEach(() => {
  cleanup()
  document.title = ''
  for (const marker of markers) {
    document.head.querySelector(`[${marker}]`)?.remove()
  }
})

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: '*', element: <DocumentHead /> }], {
    initialEntries: [path],
  })
  render(<RouterProvider router={router} />)
}

describe('DocumentHead', () => {
  it('sets a unique title, description, and canonical for the route', () => {
    renderAt('/about')
    const about = pageForPath('/about')
    expect(document.title).toBe(about.title)
    expect(
      document.head.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe(about.description)
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe(`${window.location.origin}/about/`)
    expect(
      document.head.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toContain('index, follow')
  })

  it('asks crawlers not to index an unknown route', () => {
    renderAt('/missing-page')
    expect(document.title).toBe(NOT_FOUND_PAGE.title)
    expect(
      document.head.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex, follow')
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
  })
})
