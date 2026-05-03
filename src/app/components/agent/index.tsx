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
  IonToggle,
  IonButton,
  useIonModal,
} from '@ionic/react';
import { useState } from 'react';
import {
  chevronExpandOutline,
  keyOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { shortenB64 } from '../../utils/compat';
import { useAgent } from '../../useCases/useAgent';

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
  const { keyLabels, setKeyLabel, sectionLabels, setSectionLabel } = useAgent();
  const [onlyLabeled, setOnlyLabeled] = useState(false);
  const [visibleSections, setVisibleSections] = useState(7);
  const [visibleKeysBySection, setVisibleKeysBySection] = useState<Record<number, number>>({});

  return (
    <IonContent scrollY={false}>
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
            <IonToggle
              checked={onlyLabeled}
              onIonChange={(event) => setOnlyLabeled(event.detail.checked)}
            >
              Show labeled keys only
            </IonToggle>
          </IonItem>
          <IonAccordionGroup>
            {publicKeys
              .map((keys, i) => ({
                sectionIndex: i,
                keys: keys.filter((pubKey) => !onlyLabeled || !!keyLabels[pubKey]?.trim()),
              }))
              .filter((section) => section.keys.length > 0)
              .slice(0, visibleSections)
              .map((section) => (
                <IonAccordion key={section.sectionIndex} value={publicKeys[section.sectionIndex][0]}>
                  <IonItem slot="header" color="light">
                    <IonInput
                      value={sectionLabels[section.sectionIndex] ?? `${section.sectionIndex}`}
                      placeholder={`${section.sectionIndex}`}
                      onIonInput={(event) =>
                        setSectionLabel(
                          section.sectionIndex,
                          event.detail.value?.toString() ?? '',
                        )
                      }
                    />
                  </IonItem>
                  <div className="ion-padding" slot="content">
                    {section.keys
                      .slice(0, visibleKeysBySection[section.sectionIndex] ?? 7)
                      .map((pubKey) => (
                      <IonItem key={pubKey}>
                        <IonInput
                          value={keyLabels[pubKey] ?? ''}
                          placeholder={shortenB64(pubKey)}
                          onIonInput={(event) =>
                            setKeyLabel(pubKey, event.detail.value?.toString() ?? '')
                          }
                        />
                        <IonButton
                          fill={selectedKey === pubKey ? 'solid' : 'outline'}
                          size="small"
                          disabled={selectedKey === pubKey}
                          onClick={() => {
                            const keyIndex = publicKeys[section.sectionIndex].findIndex(
                              (value) => value === pubKey,
                            );
                            setSelectedKeyIndex([section.sectionIndex, keyIndex]);
                          }}
                        >
                          Use
                        </IonButton>
                        {pubKey === selectedKey && (
                          <IonIcon
                            className="ion-margin-start"
                            icon={checkmarkCircleOutline}
                            color="success"
                          ></IonIcon>
                        )}
                      </IonItem>
                      ))}
                    {(visibleKeysBySection[section.sectionIndex] ?? 7) < section.keys.length && (
                      <IonButton
                        expand="block"
                        fill="clear"
                        onClick={() =>
                          setVisibleKeysBySection((prev) => ({
                            ...prev,
                            [section.sectionIndex]:
                              (prev[section.sectionIndex] ?? 7) + 7,
                          }))
                        }
                      >
                        Load more keys
                      </IonButton>
                    )}
                  </div>
                </IonAccordion>
              ))}
            {visibleSections < publicKeys.length && (
              <IonItem lines="none">
                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={() => setVisibleSections((count) => count + 7)}
                >
                  Load more sections
                </IonButton>
              </IonItem>
            )}
          </IonAccordionGroup>
        </section>
      </IonList>
    </IonContent>
  );
};
