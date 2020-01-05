/**
 * Creates the CustomEvent ponyfill. VK apps use the CustomEvents for transfer
 * data.
 */
const createCustomEventClass = () => {
  function CustomEvent<T>(typeArg: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T> {
    const params = eventInitDict || { bubbles: false, cancelable: false, detail: undefined };

    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(typeArg, !!params.bubbles, !!params.cancelable, params.detail);

    return evt;
  }

  CustomEvent.prototype = Event.prototype;

  return CustomEvent;
};

// Applying polyfill
if (typeof window !== 'undefined' && !window.CustomEvent) {
  (window as any).CustomEvent = createCustomEventClass();
}
