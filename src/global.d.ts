declare interface Window {
  webkit: any;
  AndroidBridge?: Record<string, (serializedData: string) => void>;
}
