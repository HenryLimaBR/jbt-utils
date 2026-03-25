import { app, nativeImage, Tray, Menu } from 'electron'
import path from 'node:path'

import { tray } from './main'

export function createTray() {
  if (tray) return tray

  const trayImage = nativeImage.createFromPath(path.join(process.env.APP_ROOT, 'public', 'icon.png'))

  const __tray = new Tray(trayImage)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Sair do JBT Utils',
      click: () => app.quit(),
    },
  ])

  __tray.setToolTip('JBT Utils')
  __tray.setContextMenu(contextMenu)

  return __tray
}