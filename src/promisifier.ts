import { VKConnectSend, VKConnectSubscribeOrUnsubscribe } from './';
import { IOMethodName, ReceiveData, ErrorData, RequestIdProp, RequestProps } from './types';

/**
 * Creates counter interface
 */
const createCounter = () => ({
  current: 0,
  next() {
    this.current += 1;

    return this.current;
  }
});

/**
 * Creates interface for resolving request promises by request id's (or not)
 */
const createRequestResolver = () => {
  type PromiseController = {
    resolve: (value: any) => any;
    reject: (reason: any) => any;
  };

  const counter = createCounter();
  const promiseControllers: Record<number | string, PromiseController | null> = {};

  return {
    /**
     * Adds new controller with resolve/reject methods
     * @param resolve Resolve function
     * @param reject Reject function
     * @returns New request id of the added controller
     */
    add: (controller: PromiseController): number => {
      const id = counter.next();

      promiseControllers[id] = controller;

      return id;
    },

    /**
     * Resolves/rejects an added promise by request id and the `isSuccess`
     * predicate
     * @param requestId Request ID
     * @param data Data to pass to the resolve- or reject-function.
     * @param isSuccess Predicate to select the desired function
     */
    resolve: <T>(requestId: number | string, data: T, isSuccess: (data: T) => boolean) => {
      const requestPromise = promiseControllers[requestId];

      if (requestPromise) {
        if (isSuccess(data)) {
          requestPromise.resolve(data);
        } else {
          requestPromise.reject(data);
        }

        promiseControllers[requestId] = null;
      }
    }
  };
};

/**
 * Returns send function that returns promises
 * @param send VK Connect send method
 * @param subscribe VK Connect subscribe method
 */
export const promisifySend = (send: VKConnectSend, subscribe: VKConnectSubscribeOrUnsubscribe) => {
  const requestResolver = createRequestResolver();

  // Subscribe to receive a data
  subscribe(event => {
    if (!event.detail || !event.detail.data) {
      return;
    }

    const { request_id: requestId, ...data } = event.detail.data as (ReceiveData | ErrorData) & RequestIdProp;

    if (requestId) {
      requestResolver.resolve(requestId, data, data => !('error_type' in data));
    }
  });

  return <K extends IOMethodName>(method: K, props?: RequestProps<K>): Promise<ReceiveData<K>> =>
    new Promise((resolve, reject) => {
      const requestId = requestResolver.add({ resolve, reject });

      send(method, {
        ...(props as RequestProps<K>),
        request_id: requestId
      });
    });
};
