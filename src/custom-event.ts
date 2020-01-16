/**
 * Creates the CustomEvent polyfill. VK apps use the CustomEvent for transfer
 * data.
 */
export function createCustomEventPolyfill() {
  function CustomEvent<T>(typeArg: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T> {
    const params = eventInitDict || { bubbles: false, cancelable: false, detail: undefined };

    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(typeArg, !!params.bubbles, !!params.cancelable, params.detail);

    return evt;
  }

  CustomEvent.prototype = Event.prototype;

  return CustomEvent;
}
