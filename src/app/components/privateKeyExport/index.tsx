import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonInput,
  IonText,
} from '@ionic/react';
import { useState } from 'react';
import { exportPrivateKey } from '../../useCases/useAgent';
import { useClipboard } from '../../useCases/useClipboard';

interface PrivateKeyExportProps {
  publicKey: string;
  selectedKeyIndex: [number, number];
  label: string;
  onComplete: () => void;
}

export const PrivateKeyExport: React.FC<PrivateKeyExportProps> = ({
  publicKey,
  selectedKeyIndex,
  label,
  onComplete,
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const { copySecretToClipboard } = useClipboard();

  const canExport = Boolean(passphrase) && confirmation === 'EXPORT';

  const copyPrivateKey = async () => {
    if (!canExport) return;

    setError('');
    let privateKey = exportPrivateKey(
      passphrase,
      label,
      selectedKeyIndex,
      publicKey,
    );

    try {
      if (!privateKey) {
        setError('The passphrase did not match this selected key.');
        return;
      }

      if (await copySecretToClipboard(privateKey)) {
        onComplete();
      }
    } finally {
      // Do not retain the encoded private key after the clipboard operation.
      privateKey = null;
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardSubtitle>Export private key</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <IonText color="danger">
          <p>
            Anyone with this private key can control this address. Clipboard
            history, synced devices, and other applications may retain it.
          </p>
          <p>
            Copy only on a trusted device, then clear your clipboard manually.
            Automatic clearing after 30 seconds is best effort.
          </p>
        </IonText>
        <IonInput
          label="Passphrase"
          labelPlacement="stacked"
          type="password"
          value={passphrase}
          autocomplete="off"
          onIonInput={(event) => setPassphrase(event.target.value?.toString() ?? '')}
        />
        <IonInput
          className="ion-margin-top"
          label='Type EXPORT to enable copying'
          labelPlacement="stacked"
          value={confirmation}
          autocomplete="off"
          onIonInput={(event) => setConfirmation(event.target.value?.toString() ?? '')}
        />
        {error && <IonText color="danger"><p>{error}</p></IonText>}
        <IonButton
          className="ion-margin-top"
          color="danger"
          disabled={!canExport}
          expand="block"
          onClick={() => void copyPrivateKey()}
        >
          Copy private key once
        </IonButton>
        <IonButton expand="block" fill="clear" onClick={onComplete}>
          Cancel
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};
