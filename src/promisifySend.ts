import {
  VKBridgeSubscribeHandler,
  AnyRequestMethodName,
  RequestProps,
  RequestIdProp,
  ReceiveData,
  AnyReceiveMethodName,
} from './types/bridge';

/**
 * Creates counter interface.
 */
function createCounter() {
  return {
    current: 0,
    next() {
      return ++this.current;
    },
  };
}

/**
 * Creates interface for resolving request promises by request id's (or not).
 */
function createRequestResolver() {
  /**
   * @prop resolve Resolve function.
   * @prop reject Reject function.
   */
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
     * @param controller Object with `resolve` and `reject` functions
     * @param customId Custom `request_id`
     * @returns New request id of the added controller.
     */
    add(controller: PromiseController, customId?: number | string): number | string {
      const id = customId != null ? customId : counter.next();

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
    },
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
  sendEvent: <K extends AnyRequestMethodName>(
    method: K,
    props?: RequestProps<K> & RequestIdProp,
  ) => void,
  subscribe: (fn: VKBridgeSubscribeHandler) => void,
) {
  const requestResolver = createRequestResolver();

  // Subscribe to receive a data
  subscribe((event) => {
    if (!event.detail || !event.detail.data || typeof event.detail.data !== 'object') {
      return;
    }

    // There is no request_id in receive-only events, so we check its existence.
    if ('request_id' in event.detail.data) {
      const { request_id: requestId, ...data } = event.detail.data;

      if (requestId) {
        requestResolver.resolve(requestId, data, (data) => !('error_type' in data));
      }
    }
  });

  return function promisifiedSend<K extends AnyRequestMethodName>(
    method: K,
    props: RequestProps<K> & RequestIdProp = {} as RequestProps<K> & RequestIdProp, // eslint-disable-line @typescript-eslint/consistent-type-assertions
  ): Promise<K extends AnyReceiveMethodName ? ReceiveData<K> : void> {
    return new Promise((resolve, reject) => {
      const requestId = requestResolver.add({ resolve, reject }, props.request_id);

      sendEvent(method, {
        ...props,
        request_id: requestId,
      });
    });
  };
}
