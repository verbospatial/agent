import { useEffect, useRef } from 'react';
import { useIonToast } from '@ionic/react';

const SECRET_CLIPBOARD_LIFETIME_MS = 30_000;

export const useClipboard = () => {
  const [present] = useIonToast();
  const clearSecretClipboardTimer = useRef<number>();

  useEffect(
    () => () => {
      if (clearSecretClipboardTimer.current) {
        window.clearTimeout(clearSecretClipboardTimer.current);
      }
    },
    [],
  );

  const copyToClipboard = async (message: string): Promise<boolean> => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable');
      }

      await navigator.clipboard.writeText(message);
      present({
        message: 'Copied.',
        duration: 1200,
        position: 'bottom',
      });
      return true;
    } catch {
      present({
        message: 'Could not copy. Check browser clipboard permissions.',
        duration: 3000,
        position: 'bottom',
      });
      return false;
    }
  };

  const copySecretToClipboard = async (secret: string): Promise<boolean> => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable');
      }

      await navigator.clipboard.writeText(secret);
      present({
        message: 'Secret copied. Clear your clipboard when finished.',
        duration: 4000,
        position: 'bottom',
      });

      if (clearSecretClipboardTimer.current) {
        window.clearTimeout(clearSecretClipboardTimer.current);
      }

      clearSecretClipboardTimer.current = window.setTimeout(() => {
        void (async () => {
          try {
            // Do not overwrite anything the user copied after the secret.
            if ((await navigator.clipboard.readText()) === secret) {
              await navigator.clipboard.writeText('');
            }
          } catch {
            // Clipboard expiry is deliberately best-effort.
          }
        })();
      }, SECRET_CLIPBOARD_LIFETIME_MS);

      return true;
    } catch {
      present({
        message: 'Could not copy. Check browser clipboard permissions.',
        duration: 3000,
        position: 'bottom',
      });
      return false;
    }
  };

  return {
    copyToClipboard,
    copySecretToClipboard,
  };
};
