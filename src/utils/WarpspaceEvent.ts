/** An object which allows the addition and removal of listeners for a warpspace event.
 * Duplicates some of the webextension event API.
 */
export class WarpspaceEvent<T extends [...any]> {
  private listeners: ((...params: T) => void)[] = [];

  fire(...args: T) {
    this.listeners.forEach((x) => {
      x(...args);
    });
  }

  /**
   * Registers an event listener callback to an event.
   * @param callback Called when an event occurs. The parameters of this function depend on the type of event.
   * The callback parameter should be a function that looks like this:
   * function() {...};
   */
  addListener(callback: (...args: T) => void) {
    this.listeners.push(callback);
  }

  /**
   * Deregisters an event listener callback from an event.
   * @param callback Listener that shall be unregistered.
   * The callback parameter should be a function that looks like this:
   * function() {...};
   */
  removeListener(callback: (...args: T) => void) {
    this.listeners = this.listeners.filter((x) => x != callback);
  }

  hasListeners() {
    return this.listeners.length > 0;
  }
}
