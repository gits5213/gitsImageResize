import { expect, test } from '@playwright/test'

const pages = [
  ['/privacy', 'Privacy Policy', 'TC21'],
  ['/terms', 'Terms of Use', 'TC22'],
  ['/security', 'Security & Privacy', 'TC23'],
  ['/disclaimer', 'Disclaimer', 'TC24'],
  ['/contact', 'Contact', 'TC25'],
] as const

for (const [path, heading, id] of pages) {
  test(`${id} ${heading} page is available`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await expect(page.getByTestId('draft-notice')).toBeVisible()
    if (path === '/contact') await expect(page.locator('form')).toHaveCount(0)
  })
}

test('TC26 footer links open the legal pages', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await expect(footer.getByRole('link', { name: 'GitHub Repository' })).toHaveAttribute(
    'href',
    'https://github.com/gits5213/gitsImageResize',
  )
  await expect(footer.getByRole('link', { name: 'Contact' })).toHaveAttribute(
    'href',
    'https://mdszaman.com/contact/',
  )

  for (const [path, heading] of [
    ['/privacy', 'Privacy Policy'],
    ['/terms', 'Terms of Use'],
    ['/security', 'Security & Privacy'],
    ['/disclaimer', 'Disclaimer'],
  ] as const) {
    await footer.getByRole('link', { name: heading }).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await page.goto('/')
  }
})
