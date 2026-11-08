import { expect, type Download, type Locator, type Page } from '@playwright/test'

export class ResizerPage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async open(path = '/'): Promise<void> {
    await this.page.goto(path)
  }

  fileInput(): Locator {
    return this.page.getByTestId('file-input')
  }

  width(): Locator {
    return this.page.getByTestId('width-input')
  }

  height(): Locator {
    return this.page.getByTestId('height-input')
  }

  async choose(filePath: string): Promise<void> {
    await this.fileInput().setInputFiles(filePath)
  }

  async upload(filePath: string): Promise<void> {
    await this.choose(filePath)
    await expect(this.page.getByTestId('original-meta')).toBeVisible()
  }

  async setWidth(value: string): Promise<void> {
    await this.width().fill(value)
  }

  async setHeight(value: string): Promise<void> {
    await this.height().fill(value)
  }

  async resize(): Promise<void> {
    await this.page.getByTestId('resize-button').click()
    await expect(this.page.getByTestId('resized-preview')).toBeVisible()
  }

  async download(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.getByTestId('download-button').click(),
    ])
    return download
  }
}
