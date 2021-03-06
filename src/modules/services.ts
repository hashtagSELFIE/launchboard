import {Launchpad} from '../launchpad'

import {DeviceManager} from './device-manager'
import {SoundManager} from './sound-manager'

import {BoardModel} from '../store/board'
import {createStore, StoreModel} from '../store'
import {save, load, loadRemote} from './save-manager'
import {addMiddleware} from 'mobx-state-tree'
import {SoundMiddleware} from './sound-middleware'

// Return all the dependent singleton services.
interface Services {
  store: StoreModel
  device: Launchpad
  deviceManager: DeviceManager
  soundManager: SoundManager
}

// Allow services to be global for debugging purposes.
declare global {
  interface Window extends Services {
    board: BoardModel
    save: typeof save
    load: typeof load
    loadRemote: typeof loadRemote
  }
}

const useDebugGlobals = true // process.env.NODE_ENV === 'development'

export function createServices(): Services {
  // First, initialize the root store.
  const store = createStore()

  // Initialize the singleton services here.
  const device = new Launchpad()
  const deviceManager = new DeviceManager(device, store.board)
  const soundManager = new SoundManager(store)

  // Sound Management Middleware
  addMiddleware(store.board, SoundMiddleware(soundManager, store.board))

  // Window global for DevTools debugging.
  if (useDebugGlobals) {
    window.store = store
    window.board = store.board
    window.device = device
    window.deviceManager = deviceManager
    window.soundManager = soundManager

    // Save and load utilities for debugging
    window.save = () => save(store.board)
    window.load = () => load(store.board)
    window.loadRemote = (url: string) => loadRemote(url, store.board)
  }

  return {store, device, deviceManager, soundManager}
}
