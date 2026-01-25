import { Maximize, Maximize2, Minimize2, Minus, X } from 'lucide-react'
import type { AppCommand } from './types'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/core'

const isWindows =
  typeof navigator !== 'undefined' && /Windows/.test(navigator.userAgent)

export const windowCommands: AppCommand[] = [
  {
    id: 'window-close',
    label: 'Close Window',
    description: 'Close the current window',
    icon: X,
    group: 'window',
    shortcut: '⌘+W',

    execute: async context => {
      try {
        const appWindow = getCurrentWindow()
        // On Windows, close() doesn't work reliably with custom titlebars
        // We need to use destroy() but must check for running sessions first
        if (isWindows) {
          // Check for running sessions (same logic as onCloseRequested handler)
          // Only check in production mode
          if (!import.meta.env.DEV) {
            try {
              const hasRunning = await invoke<boolean>('has_running_sessions')
              if (hasRunning) {
                // Trigger the quit confirmation dialog
                window.dispatchEvent(
                  new CustomEvent('quit-confirmation-requested')
                )
                return
              }
            } catch {
              // Allow quit if we can't check (fail open)
            }
          }
          await appWindow.destroy()
        } else {
          await appWindow.close()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        context.showToast(`Failed to close window: ${message}`, 'error')
      }
    },
  },

  {
    id: 'window-minimize',
    label: 'Minimize Window',
    description: 'Minimize the current window',
    icon: Minus,
    group: 'window',
    shortcut: '⌘+M',

    execute: async context => {
      try {
        const appWindow = getCurrentWindow()
        await appWindow.minimize()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        context.showToast(`Failed to minimize window: ${message}`, 'error')
      }
    },
  },

  {
    id: 'window-toggle-maximize',
    label: 'Toggle Maximize',
    description: 'Toggle window maximize state',
    icon: Maximize2,
    group: 'window',

    execute: async context => {
      try {
        const appWindow = getCurrentWindow()
        await appWindow.toggleMaximize()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        context.showToast(`Failed to toggle maximize: ${message}`, 'error')
      }
    },
  },

  {
    id: 'window-fullscreen',
    label: 'Enter Fullscreen',
    description: 'Enter fullscreen mode',
    icon: Maximize,
    group: 'window',
    shortcut: 'F11',

    execute: async context => {
      try {
        const appWindow = getCurrentWindow()
        await appWindow.setFullscreen(true)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        context.showToast(`Failed to enter fullscreen: ${message}`, 'error')
      }
    },
  },

  {
    id: 'window-exit-fullscreen',
    label: 'Exit Fullscreen',
    description: 'Exit fullscreen mode',
    icon: Minimize2,
    group: 'window',
    shortcut: 'Escape',

    execute: async context => {
      try {
        const appWindow = getCurrentWindow()
        await appWindow.setFullscreen(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        context.showToast(`Failed to exit fullscreen: ${message}`, 'error')
      }
    },
  },
]
