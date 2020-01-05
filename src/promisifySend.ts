import {
  VKConnectSubscribeHandler,
  RequestMethodName,
  RequestProps,
  RequestIdProp,
  ReceiveData,
  ReceiveMethodName
} from './types/connect';

/**
 * Creates counter interface.
 */
function createCounter() {
  return {
    current: 0,
    next() {
      this.current += 1;

      return this.current;
    }
  };
}

/**
 * Creates interface for resolving request promises by request id's (or not).
 */
function createRequestResolver() {
  type PromiseController = {
    resolve: (value: any) => any;
    reject: (reason: any) => any;
  };

  const counter = createCounter();
  const promiseControllers: Record<number | string, PromiseController | null> = {};

  return {
    /**
     * Adds new controller with resolve/reject methods.
     *
     * @param resolve Resolve function.
     * @param reject Reject function.
     * @returns New request id of the added controller.
     */
    add(controller: PromiseController): number {
      const id = counter.next();

      promiseControllers[id] = controller;

      return id;
    },

    /**
     * Resolves/rejects an added promise by request id and the `isSuccess`
     * predicate.
     *
     * @param requestId Request ID.
     * @param data Data to pass to the resolve- or reject-function.
     * @param isSuccess Predicate to select the desired function.
     */
    resolve<T>(requestId: number | string, data: T, isSuccess: (data: T) => boolean) {
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
}

/**
 * Returns send function that returns promises.
 *
 * @param sendEvent Send event function.
 * @param subscribe Subscribe event function.
 * @returns Send function which returns the Promise object.
 */
export function promisifySend(
  sendEvent: <K extends RequestMethodName>(method: K, props?: RequestProps<K> & RequestIdProp) => void,
  subscribe: (fn: VKConnectSubscribeHandler) => void
) {
  const requestResolver = createRequestResolver();

  // Subscribe to receive a data
  subscribe(event => {
    if (!event.detail || !event.detail.data) {
      return;
    }

    const { request_id: requestId, ...data } = event.detail.data;

    if (requestId) {
      requestResolver.resolve(requestId, data, data => !('error_type' in data));
    }
  });

  return function promisifiedSend<K extends RequestMethodName>(
    method: K,
    props: RequestProps<K> = {} as RequestProps<K>
  ): Promise<K extends ReceiveMethodName ? ReceiveData<K> : void> {
    return new Promise((resolve, reject) => {
      const requestId = requestResolver.add({ resolve, reject });

      sendEvent(method, {
        ...props,
        request_id: requestId
      });
    });
  };
}
