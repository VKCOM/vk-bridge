declare interface Window {
  webkit: any;
  AndroidBridge?: Record<string, undefined | ((serializedData: string) => void)>;
  CustomEvent: typeof CustomEvent | typeof undefined;
}
