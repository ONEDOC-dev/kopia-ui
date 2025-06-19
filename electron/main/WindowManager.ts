import {BrowserWindow} from "electron";
import Store from "electron-store";
import _ from "lodash";

export class WindowManager extends Map<String, BrowserWindow> {
  private readonly store: Store;

  constructor(store: Store) {
    super();
    this.store = store;
  }

  public addWindow(key: string, window: BrowserWindow) {
    window.once('closed', () => {
      if (this.has(key)) this.delete(key);
    });
    this.set(key, window);
  }

  public setListenWindowBounceState(key: string) {
    const window = this.get(key)
    if (!window) throw new Error(`Window with key ${key} is not found`);
    const _handleBoundsChangeEvent = this.handleBoundsChangeEvent.bind(this, key, window);
    const throttledEvent = _.throttle(_handleBoundsChangeEvent, 1000, {
      leading: true,
      trailing: true
    });
    window.on('resize', throttledEvent);
    window.on('move', throttledEvent);

    window.on('enter-full-screen', () => {
      this.handleBoundsChangeEvent(key, window)
      window.maximize();
    });

    window.on('leave-full-screen', () => {
      this.handleBoundsChangeEvent(key, window)
    });
    window.on('closed', () => {
      throttledEvent.cancel();
    });
  }

  private handleBoundsChangeEvent(key: string, window: BrowserWindow) {
    const bounds = window.getBounds();
    this.store.set(`window-info-${key}`, {
      ...bounds,
      isFullScreen: window.isFullScreen()
    });
    console.log(`window[${key}] 상태변경 이벤트:`, bounds, window.isFullScreen());
  }

}