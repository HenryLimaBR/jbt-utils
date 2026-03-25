import { app, nativeImage, Tray, Menu } from 'electron'

import { iconPath, tray } from './main'

export function createTray() {
  if (tray) return tray

  const trayImage = nativeImage.createFromPath(iconPath)

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