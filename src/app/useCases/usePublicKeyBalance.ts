import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../utils/appContext';

export const usePublicKeyBalance = (publicKey: string) => {
  const { requestBalance } = useContext(AppContext);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    let cleanup = () => {};
    if (!publicKey) {
      setBalance(0);
      return;
    }

    cleanup =
      requestBalance(publicKey, ({ balance: nextBalance }) => {
        setBalance(nextBalance || 0);
      }) ?? cleanup;

    return () => cleanup();
  }, [publicKey, requestBalance]);

  return balance;
};
