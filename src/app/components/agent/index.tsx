import {
  IonAccordion,
  IonAccordionGroup,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonInput,
  useIonModal,
} from '@ionic/react';
import {
  chevronExpandOutline,
  keyOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { shortenB64 } from '../../utils/compat';
import { KeyAbbrev } from '../keyChip';
import { useAgent } from '../../useCases/useAgent';
import { usePublicKeyBalance } from '../../useCases/usePublicKeyBalance';

const Agent = ({
  hideLabel,
  publicKeys,
  selectedKeyIndex,
  setSelectedKeyIndex,
}: {
  hideLabel?: boolean;
  publicKeys: string[][];
  selectedKeyIndex: [number, number];
  setSelectedKeyIndex: (key: [number, number]) => void;
}) => {
  const { keyLabels } = useAgent();
  const [present, dismiss] = useIonModal(KeyDetails, {
    onDismiss: () => dismiss(),
    selectedKeyIndex,
    publicKeys,
    setSelectedKeyIndex,
  });

  const selectedKey = publicKeys[selectedKeyIndex[0]][selectedKeyIndex[1]];

  return selectedKey ? (
    <IonChip
      onClick={(e) => {
        e.stopPropagation();
        present({
          initialBreakpoint: 0.75,
          breakpoints: [0, 0.75, 1],
        });
      }}
    >
      {!hideLabel && <code>{keyLabels[selectedKey] || shortenB64(selectedKey)}</code>}
      <IonIcon
        style={
          hideLabel
            ? {
                marginLeft: '-4px',
              }
            : {}
        }
        icon={chevronExpandOutline}
        color="primary"
      ></IonIcon>
    </IonChip>
  ) : null;
};

export default Agent;

const KeyDetails = ({
  onDismiss,
  publicKeys,
  selectedKeyIndex,
  setSelectedKeyIndex,
}: {
  onDismiss: () => void;
  publicKeys: string[][];
  selectedKeyIndex: [number, number];
  setSelectedKeyIndex: (key: [number, number]) => void;
}) => {
  const selectedKey = publicKeys[selectedKeyIndex[0]][selectedKeyIndex[1]];
  const { keyLabels, setKeyLabel } = useAgent();
  const balance = usePublicKeyBalance(selectedKey);

  return (
    <IonContent scrollY={false}>
      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
      </div>

      <IonList>
        <IonListHeader>
          <IonLabel>
            <h2>
              Keys <IonIcon icon={keyOutline} color="primary"></IonIcon>
            </h2>
          </IonLabel>
        </IonListHeader>
        <section className="ion-content-scroll-host">
          <IonItem lines="none">
            <IonLabel position="stacked">Friendly label</IonLabel>
            <IonInput
              value={keyLabels[selectedKey] ?? ''}
              placeholder={shortenB64(selectedKey)}
              onIonInput={(event) =>
                setKeyLabel(selectedKey, event.target.value?.toString() ?? '')
              }
            />
            <IonLabel className="ion-margin-top">
              Balance: {(balance / 100000000).toFixed(8)} CRUZ
            </IonLabel>
          </IonItem>
          <IonAccordionGroup>
            {publicKeys.map((keys, i) => (
              <IonAccordion key={i} value={publicKeys[i][0]}>
                <IonItem slot="header" color="light">
                  <IonLabel>
                    {i}
                    <IonIcon
                      className="ion-margin-start ion-margin-end"
                      icon={arrowForwardOutline}
                    />
                    <KeyAbbrev value={publicKeys[i][0]} />
                  </IonLabel>
                </IonItem>
                <div className="ion-padding" slot="content">
                  {keys.map((pubKey, j) => (
                    <IonItem
                      key={pubKey}
                      button
                      detail={selectedKey !== pubKey}
                      onClick={() => {
                        setSelectedKeyIndex([i, j]);
                      }}
                      aria-selected={selectedKey === pubKey}
                      disabled={selectedKey === pubKey}
                    >
                      <IonLabel>
                        <code>{keyLabels[pubKey] || shortenB64(pubKey)}</code>
                        {pubKey === selectedKey && (
                          <IonIcon
                            className="ion-margin-start"
                            icon={checkmarkCircleOutline}
                            color="success"
                          ></IonIcon>
                        )}
                      </IonLabel>
                    </IonItem>
                  ))}
                </div>
              </IonAccordion>
            ))}
          </IonAccordionGroup>
        </section>
      </IonList>
    </IonContent>
  );
};
