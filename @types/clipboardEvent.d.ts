declare module 'clipboard-event' {
  interface ClipboardEventMap {
    'change': string
  }

  interface ClipboardListener extends NodeJS.EventEmitter {
    startListening(): void
    stopListening(): void

    on<K extends keyof ClipboardEventMap>(event: K, listener: (value: ClipboardEventMap[K]) => void): this
    on(event: string | symbol, listener: (...args: unknown[]) => void): this
  }


  const defaultExport: ClipboardListener
  export = defaultExport
}