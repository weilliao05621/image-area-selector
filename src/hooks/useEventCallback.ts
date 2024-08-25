import { useRef, useCallback } from "react";

type Callback<T extends unknown[], O> = (...args: T) => O;

const useEventCallback = <I extends unknown[], O>(cb: Callback<I, O>) => {
  const callbackRef = useRef<Callback<I, O>>(cb);
  callbackRef.current = cb;

  return useCallback((...args: I) => {
    return callbackRef.current(...args);
  }, []);
};

export default useEventCallback;
