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

  async setMaxFileSize(value: string): Promise<void> {
    await this.page.getByTestId('max-file-size').fill(value)
  }

  async chooseBackground(id: string): Promise<void> {
    await this.page.getByTestId('background-select').selectOption(id)
  }

  async setLightFocus(value: string): Promise<void> {
    await this.page.getByTestId('light-focus').fill(value)
  }

  async sampleResized(x: number, y: number): Promise<number[]> {
    const preview = this.page.getByTestId('resized-preview')
    await expect
      .poll(() => preview.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0)
    return preview.evaluate(
      (image: HTMLImageElement, point) => {
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Canvas is unavailable.')
        context.drawImage(image, 0, 0)
        return Array.from(context.getImageData(point.x, point.y, 1, 1).data)
      },
      { x, y },
    )
  }

  async resize(): Promise<void> {
    const button = this.page.getByTestId('resize-button')
    await expect(button).toBeEnabled()
    await button.click()
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
