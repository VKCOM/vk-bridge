/**
 * Creates the CustomEvent ponyfill. VK clients use the CustomEvents to transfer data.
 */
export declare const createCustomEventClass: () => {
    <T>(typeArg: string, eventInitDict?: CustomEventInit<T> | undefined): CustomEvent<T>;
    prototype: Event;
};
