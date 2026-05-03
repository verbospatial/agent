import { useState, useEffect, useDeferredValue } from 'react';
import { ZxcvbnResult } from '@zxcvbn-ts/core';
import { useInputValidationProps } from './useInputValidation';

declare global {
  interface Window {
    zxcvbnts: any;
  }
}

window.zxcvbnts = window.zxcvbnts || {};

export const usePasswordValidationProps = (
  validate: (pwd: string, strength: ZxcvbnResult | null | undefined) => boolean,
) => {
  const [result, setResult] = useState<ZxcvbnResult | null>();

  const { value, onBlur, isValid, isTouched, onInputChange } =
    useInputValidationProps((inputVal) => validate(inputVal, result));

  // NOTE: useDeferredValue is React v18 only, for v17 or lower use debouncing
  const deferredPassword = useDeferredValue(value);

  useEffect(() => {
    const zxcvbnAsync = window.zxcvbnts?.core?.zxcvbnAsync;

    if (typeof zxcvbnAsync !== 'function') {
      setResult(null);
      return;
    }

    zxcvbnAsync(deferredPassword)
      .then((response: any) => setResult(response))
      .catch(() => setResult(null));
  }, [deferredPassword]);

  return {
    result,
    value,
    onBlur,
    isValid,
    isTouched,
    onInputChange,
  };
};
