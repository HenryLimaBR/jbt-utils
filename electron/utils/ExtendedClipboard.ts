import { clipboard } from 'electron'

interface ClipboardEvents {
  text: string
  image: Electron.NativeImage
}

interface ClipboardListener {
  listenerId: string
  event: keyof ClipboardEvents
  callback: (data: unknown) => void
}

class ExtendedClipboard {
  private timer: NodeJS.Timeout | null = null

  private listeners: ClipboardListener[] = []

  private lastTextClipboard = clipboard.readText()
  private lastImageClipboard = clipboard.readImage()

  constructor(private interval: number = 1000) { }

  private update() {
    const currentText = clipboard.readText()
    const currentImage = clipboard.readImage()

    const textChanged = currentText !== this.lastTextClipboard
    const imageChanged = !currentImage.isEmpty() && currentImage.toDataURL() !== this.lastImageClipboard.toDataURL()

    if (textChanged) {
      this.lastTextClipboard = currentText
      this.listeners
        .filter(listener => listener.event === 'text')
        .forEach(listener => listener.callback(currentText))
    }

    if (imageChanged) {
      this.lastImageClipboard = currentImage
      this.listeners
        .filter(listener => listener.event === 'image')
        .forEach(listener => listener.callback(currentImage))
    }
  }

  private startCapturing() {
    if (this.timer) {
      return
    }

    this.timer = setInterval(() => {
      this.update()
    }, this.interval)
  }

  private stopCapturing() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  public on(event: 'image', callback: (data: Electron.NativeImage) => void): string
  public on(event: 'text', callback: (data: string) => void): string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: keyof ClipboardEvents, callback: (data: any) => void): string {
    const listenerId = crypto.randomUUID()

    if (this.listeners.length === 0) {
      this.startCapturing()
    }

    this.listeners.push({ listenerId, event, callback })
    return listenerId
  }

  public off(listenerId: string) {
    this.listeners = this.listeners.filter(listener => listener.listenerId !== listenerId)

    if (this.listeners.length === 0) {
      this.stopCapturing()
    }
  }

  public offAll() {
    this.listeners = []
    this.stopCapturing()
  }
}

export const extendedClipboard = new ExtendedClipboard()