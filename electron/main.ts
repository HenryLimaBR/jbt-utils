import 'regenerator-runtime/runtime'
import { app, clipboard, Notification, Tray } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { writeFile } from 'node:fs/promises'

import { extendedClipboard } from './utils/ExtendedClipboard'
import { createTray } from './tray'
import { OpticalCharRecog } from './utils/OpticalCharRecog'
import { ImageEdit } from './utils/ImageEdit'
// import { createClipboardWindow } from './window/clipboardWindow'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))


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

export let tray: Tray | null = null
// export let clipboardWindow: BrowserWindow | null = null

app.whenReady().then(async () => {
  tray = createTray()
  // clipboardWindow = createClipboardWindow()

  extendedClipboard.on('image', async (image: Electron.NativeImage) => {
    const processedImage = await ImageEdit.prepareForOCR(image.toPNG(), {
      width: image.getSize().width,
      height: image.getSize().height
    })

    await writeFile(path.join(process.env.APP_ROOT, 'debug', `processed_clipboard_dbg_image.png`), processedImage).catch(console.error)

    const text = await OpticalCharRecog.recognize('text', processedImage)

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
      // clipboardWindow = createClipboardWindow()
    })

    notification.show()
  })

  app.on('before-quit', async () => {
    await OpticalCharRecog.terminateAll()
  })
})
