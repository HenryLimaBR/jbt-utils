import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const tesseract = require('tesseract.js') as typeof import('tesseract.js')

type OpticalWorkerType = 'text' | 'number' | 'barcode' | 'line'

const workerConfigs: Record<OpticalWorkerType, Partial<Tesseract.WorkerParams>> = {
  'text': {
    tessedit_pageseg_mode: tesseract.PSM.SINGLE_BLOCK,
  },
  'number': {
    tessedit_pageseg_mode: tesseract.PSM.SINGLE_LINE,
    tessedit_char_whitelist: '0123456789 ',
  },
  'barcode': {
    tessedit_pageseg_mode: tesseract.PSM.SINGLE_BLOCK,
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  'line': {
    tessedit_pageseg_mode: tesseract.PSM.SINGLE_LINE,
  },
}

const workerLanguages = ['por', 'eng']

export class OpticalCharRecog {
  private static workers = new Map<OpticalWorkerType, Tesseract.Worker>()

  private static async getWorker(kind: OpticalWorkerType): Promise<Tesseract.Worker> {
    if (this.workers.has(kind)) {
      return Promise.resolve(this.workers.get(kind)!)
    }

    return this.createWorker(kind)
  }

  private static async createWorker(kind: OpticalWorkerType): Promise<Tesseract.Worker> {
    const worker = await tesseract.createWorker(workerLanguages)
    await worker.setParameters(workerConfigs[kind])
    this.workers.set(kind, worker)

    return worker
  }

  public static async recognize(kind: OpticalWorkerType, image: Buffer): Promise<string> {
    const worker = await this.getWorker(kind)
    const { data: { text } } = await worker.recognize(image)

    return text
  }

  public static async terminateWorker(kind: OpticalWorkerType): Promise<void> {
    if (this.workers.has(kind)) {
      await this.workers.get(kind)!.terminate()
      this.workers.delete(kind)
    }
  }

  public static async terminateAll(): Promise<void> {
    for (const worker of this.workers.values()) {
      await worker.terminate()
    }
  }
}