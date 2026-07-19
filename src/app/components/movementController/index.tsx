import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTextarea,
  useIonToast,
} from '@ionic/react';
import { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from '../../utils/appContext';
import { useAgent } from '../../useCases/useAgent';
import { usePersistentState } from '../../useCases/usePersistentState';
import { defaultControllerSettings, ControllerPosition, tryCreateControllerDraft } from './controllerUtils';

const useEmission = () => {
  const { pushTransaction } = useContext(AppContext);
  const { selectedKeyIndex, label } = useAgent();
  const [passphrase, setPassphrase] = useState('');
  const pendingResultCleanups = useRef(new Set<() => void>());
  const [presentToast] = useIonToast();

  const cleanupPendingResults = useCallback(() => {
    pendingResultCleanups.current.forEach((cleanup) => cleanup());
    pendingResultCleanups.current.clear();
  }, []);

  const emit = async (to: string, memo: string, amountCruzbits: number) => {
    if (!passphrase) return;

    let resultCleanup: (() => void) | undefined;
    resultCleanup = await pushTransaction(
      to,
      memo,
      amountCruzbits,
      passphrase,
      label,
      selectedKeyIndex,
      (data) => {
        if (data.error) {
          presentToast({ message: data.error, duration: 3000, position: 'bottom' });
        }

        if (resultCleanup) {
          resultCleanup();
          pendingResultCleanups.current.delete(resultCleanup);
        }
      },
    );

    if (resultCleanup) {
      pendingResultCleanups.current.add(resultCleanup);
    }
  };

  const stop = useCallback(() => {
    setPassphrase('');
    cleanupPendingResults();
  }, [cleanupPendingResults]);

  useEffect(() => {
    window.addEventListener('blur', stop);
    return () => {
      window.removeEventListener('blur', stop);
      stop();
    };
  }, [stop]);

  return { isActive: !!passphrase, passphrase, setPassphrase, stop, emit };
};

const focusedEditable = () => {
  const tagName = document.activeElement?.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'ion-input' || tagName === 'ion-textarea';
};

const WasdController = ({ settings }: { settings: typeof defaultControllerSettings }) => {
  const emitter = useEmission();
  const keys = useRef(new Set<string>());
  const [position, setPosition] = useState<ControllerPosition>({ x: 0, y: 0, z: 0 });
  const [speed, setSpeed] = useState(1);
  const draftResult = useMemo(() => tryCreateControllerDraft(settings, position), [settings, position]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (focusedEditable()) return;
      if ('wasdqe'.includes(event.key.toLowerCase())) {
        keys.current.add(event.key.toLowerCase());
        event.preventDefault();
      }
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    if (!emitter.isActive) return;
    const interval = window.setInterval(() => {
      if (!keys.current.size) return;
      setPosition((current) => {
        const next = { ...current };
        if (keys.current.has('a')) next.x -= speed;
        if (keys.current.has('d')) next.x += speed;
        if (keys.current.has('w')) next.z -= speed;
        if (keys.current.has('s')) next.z += speed;
        if (keys.current.has('q')) next.y -= speed;
        if (keys.current.has('e')) next.y += speed;
        const nextDraftResult = tryCreateControllerDraft(settings, next);
        if (nextDraftResult.draft) {
          emitter.emit(
            nextDraftResult.draft.to,
            nextDraftResult.draft.memo,
            nextDraftResult.draft.amountCruzbits,
          );
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [emitter, settings, speed]);

  return (
    <IonCard>
      <IonCardHeader><IonCardSubtitle>WASD controller</IonCardSubtitle></IonCardHeader>
      <IonCardContent>
        <IonItem><IonInput label="Speed" labelPlacement="stacked" type="number" value={speed} min={1} onIonInput={(e) => setSpeed(Number(e.detail.value) || 1)} /></IonItem>
        <IonItem><IonInput label="Emission passphrase" labelPlacement="stacked" type="password" value={emitter.passphrase} onIonInput={(e) => emitter.setPassphrase(e.detail.value?.toString() ?? '')} /></IonItem>
        <IonButton expand="block" color={emitter.isActive ? 'danger' : 'primary'} onClick={() => emitter.isActive ? emitter.stop() : undefined}>{emitter.isActive ? 'Stop realtime emission' : 'Enter passphrase to start'}</IonButton>
        <IonText color="medium"><p>Use W/A/S/D to move on X/Z and Q/E for height. Position: {position.x}, {position.y}, {position.z}</p></IonText>
        {draftResult.error && <IonText color="danger"><p>{draftResult.error}</p></IonText>}
        <IonTextarea readonly value={draftResult.draft?.to ?? ''} aria-label="WASD spatial destination preview" />
        <IonTextarea readonly value={draftResult.draft?.memo ?? ''} aria-label="WASD spatial memo preview" />
      </IonCardContent>
    </IonCard>
  );
};

const DrawingController = ({ settings }: { settings: typeof defaultControllerSettings }) => {
  const emitter = useEmission();
  const [lastPoint, setLastPoint] = useState<ControllerPosition | null>(null);
  const draftResult = useMemo(() => tryCreateControllerDraft(settings, lastPoint ?? { x: 0, y: 0, z: 0 }), [settings, lastPoint]);

  const draw = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!emitter.isActive || event.buttons !== 1) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = {
      x: Math.round((event.clientX - rect.left) / 20),
      y: 0,
      z: Math.round((event.clientY - rect.top) / 20),
    };
    if (lastPoint && Math.hypot(point.x - lastPoint.x, point.z - lastPoint.z) < 1) return;
    setLastPoint(point);
    const nextDraftResult = tryCreateControllerDraft(settings, point);
    if (nextDraftResult.draft) {
      emitter.emit(
        nextDraftResult.draft.to,
        nextDraftResult.draft.memo,
        nextDraftResult.draft.amountCruzbits,
      );
    }
  };

  return (
    <IonCard>
      <IonCardHeader><IonCardSubtitle>2D drawing controller</IonCardSubtitle></IonCardHeader>
      <IonCardContent>
        <IonItem><IonInput label="Emission passphrase" labelPlacement="stacked" type="password" value={emitter.passphrase} onIonInput={(e) => emitter.setPassphrase(e.detail.value?.toString() ?? '')} /></IonItem>
        <IonButton expand="block" color={emitter.isActive ? 'danger' : 'primary'} onClick={() => emitter.isActive ? emitter.stop() : undefined}>{emitter.isActive ? 'Stop drawing emission' : 'Enter passphrase to start'}</IonButton>
        <div onPointerMove={draw} onPointerDown={draw} style={{ height: 240, border: '1px solid var(--ion-color-medium)', borderRadius: 8, touchAction: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(128,128,128,.18) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(128,128,128,.18) 20px)' }} />
        {draftResult.error && <IonText color="danger"><p>{draftResult.error}</p></IonText>}
        <IonTextarea readonly value={draftResult.draft?.to ?? ''} aria-label="Drawing spatial destination preview" />
        <IonTextarea readonly value={draftResult.draft?.memo ?? ''} aria-label="Drawing spatial memo preview" />
      </IonCardContent>
    </IonCard>
  );
};

export const MovementControllerPanel = ({ plainTextTransaction }: { plainTextTransaction: ReactNode }) => {
  const [mode, setMode] = usePersistentState<'plain-text' | 'wasd' | 'drawing'>('controller-mode', 'plain-text');
  const [namespace, setNamespace] = usePersistentState('controller-object-namespace', '');
  const [geometry, setGeometry] = usePersistentState('controller-geometry', 'box');
  const [color, setColor] = usePersistentState('controller-color', '0x33aaff');
  const [amountCruzbits, setAmountCruzbits] = usePersistentState('controller-amount-cruzbits', defaultControllerSettings.amountCruzbits);

  const settings = useMemo(() => ({ ...defaultControllerSettings, namespace, geometry, color, amountCruzbits }), [namespace, geometry, color, amountCruzbits]);

  return (
    <section className="ion-padding">
      <IonCard>
        <IonCardHeader><IonCardSubtitle>Transaction mode</IonCardSubtitle></IonCardHeader>
        <IonCardContent>
          <IonSegment value={mode} onIonChange={(event) => setMode((event.detail.value as 'plain-text' | 'wasd' | 'drawing') ?? 'plain-text')}>
            <IonSegmentButton value="plain-text"><IonLabel>Plain text</IonLabel></IonSegmentButton>
            <IonSegmentButton value="wasd"><IonLabel>WASD</IonLabel></IonSegmentButton>
            <IonSegmentButton value="drawing"><IonLabel>Drawing</IonLabel></IonSegmentButton>
          </IonSegment>
          {mode !== 'plain-text' && <>
            <IonItem><IonInput label="Object namespace" labelPlacement="stacked" value={namespace} onIonInput={(e) => setNamespace(e.detail.value?.toString() ?? '')} /></IonItem>
            <IonItem><IonInput label="Geometry" labelPlacement="stacked" value={geometry} onIonInput={(e) => setGeometry(e.detail.value?.toString() ?? 'box')} /></IonItem>
            <IonItem><IonInput label="Color/material" labelPlacement="stacked" value={color} onIonInput={(e) => setColor(e.detail.value?.toString() ?? '0x33aaff')} /></IonItem>
            <IonItem><IonInput label="Amount (cruzbits)" labelPlacement="stacked" type="number" value={amountCruzbits} onIonInput={(e) => setAmountCruzbits(Number(e.detail.value) || defaultControllerSettings.amountCruzbits)} /></IonItem>
          </>}
        </IonCardContent>
      </IonCard>
      {mode === 'plain-text' && plainTextTransaction}
      {mode === 'wasd' && <WasdController settings={settings} />}
      {mode === 'drawing' && <DrawingController settings={settings} />}
    </section>
  );
};
