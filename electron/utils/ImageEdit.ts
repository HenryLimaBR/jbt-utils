import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const sharp = require('sharp') as typeof import('sharp')

export class ImageEdit {
  public static async prepareForOCR(image: Buffer, size: { width: number, height: number }): Promise<Buffer> {
    return await sharp(image)
      .resize({ width: Math.min(size.width * 2, 2000), kernel: sharp.kernel.lanczos3, withoutEnlargement: false })
      .grayscale()
      .sharpen()
      .threshold(150)
      .normalize()
      .toBuffer()
  }
}