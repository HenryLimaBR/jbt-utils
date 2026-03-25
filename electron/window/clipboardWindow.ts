// TODO Tela de clipboard para mostrar o texto copiado e permitir copiar formatado de formas diferentes

/* import { BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { clipboardWindow, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../main'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createClipboardWindow() {
  if (clipboardWindow) return clipboardWindow

  const __clipboardWindow = new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    resizable: false,
    title: 'Área de Transferência Inteligente',
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if(VITE_DEV_SERVER_URL) {
    __clipboardWindow.loadURL(`${VITE_DEV_SERVER_URL}/clipboard`)
  } else {
    __clipboardWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  return __clipboardWindow
} */