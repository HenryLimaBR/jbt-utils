import { app, clipboard, Menu, nativeImage, Notification, Tray } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { extendedClipboard } from './utils/ExtendedClipboard'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const tesseract = require('tesseract.js') as typeof import('tesseract.js')
const sharp = require('sharp') as typeof import('sharp')

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let trayIcon: Tray | null = null

function createTrayIcon() {
  if (trayIcon) {
    return
  }

  const trayImage = nativeImage.createFromPath(path.join(process.env.APP_ROOT, 'public', 'icon.png'))

  trayIcon = new Tray(trayImage)
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Sair', click: () => app.quit() },
  ])

  trayIcon.setToolTip('JBT Utils')
  trayIcon.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
  // createWindow()
  createTrayIcon()
})

let ocrWorker: Tesseract.Worker | null = null

app.whenReady().then(async () => {
  ocrWorker = await tesseract.createWorker('por')

  await ocrWorker.setParameters({
    tessedit_pageseg_mode: tesseract.PSM.SINGLE_LINE,
    tessedit_char_whitelist: '0123456789., ',
  })

  extendedClipboard.on('image', async (image: Electron.NativeImage) => {
    if (!ocrWorker) {
      console.error('OCR Worker não inicializado!')
      return
    }

    const processedImage = await sharp(image.toPNG())
      .resize({ width: image.getSize().width * 4, kernel: sharp.kernel.lanczos3, withoutEnlargement: false })
      .grayscale()
      .sharpen()
      .threshold(150)
      .toBuffer()

    const { data: { text } } = await ocrWorker.recognize(processedImage, { rotateAuto: true })

    if (text.replace(/\s/g, '').length === 0) {
      console.log('Nenhum texto detectado na imagem.')
      return
    }

    console.log('Text:', text.trim())

    const notification = new Notification({
      icon: path.join(process.env.APP_ROOT, 'public', 'jb.png'),
      title: 'Números detectados na imagem!',
      body: `${text.trim()} - Clique aqui para copiar!`,
      subtitle: 'Utilitário JB Transportes',
      urgency: 'critical',
      closeButtonText: 'Fechar',
    })

    notification.on('click', () => {
      clipboard.writeText(text.trim())
      notification.close()
    })

    notification.show()
  })

  app.on('before-quit', async () => {
    if (ocrWorker) {
      await ocrWorker.terminate()
    }
  })
})

