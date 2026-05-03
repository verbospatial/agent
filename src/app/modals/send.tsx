import { useContext } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonList,
  IonTextarea,
  useIonActionSheet,
  useIonModal,
  useIonToast,
} from '@ionic/react';
import {
  ellipsisHorizontal,
  ellipsisVertical,
} from 'ionicons/icons';
import type { OverlayEventDetail } from '@ionic/core';
import { PageShell } from '../components/pageShell';
import { useInputValidationProps } from '../useCases/useInputValidation';
import KeyChip from '../components/keyChip';
import Agent from '../components/agent';
import { useAgent } from '../useCases/useAgent';
import { AppContext } from '../utils/appContext';
import { shortenHex } from '../utils/compat';
import { SetupAgent } from '../components/agentSetup';
import { TransactionList } from '../components/transaction';
import { usePendingTransactions } from '../useCases/usePendingTxs';
import { usePubKeyTransactions } from '../useCases/usePubKeyTxs';
import { usePublicKeyBalance } from '../useCases/usePublicKeyBalance';
import { MinAmountCruzbits } from '../utils/constants';

const Send = () => {
  const { pushTransaction } = useContext(AppContext);

  const {
    value: address,
    onBlur: onBlurAddress,
    isValid: isAddressValid,
    isTouched: isAddressTouched,
    onInputChange: setAddress,
  } = useInputValidationProps(
    (address: string) => new RegExp('[A-Za-z0-9/+]{43}=').test(address),
    '',
  );

  const {
    value: memo,
    onBlur: onBlurMemo,
    isValid: isMemoValid,
    isTouched: isMemoTouched,
    onInputChange: setMemo,
  } = useInputValidationProps(
    (memo: string) => memo.length > 0 || memo.length <= 150,
  );

  const [presentToast] = useIonToast();

  const execute = (
    passphrase: string,
    selectedKeyIndex: [number, number],
    amountCruzbits: number,
  ) => {
    if (!isAddressValid || !isMemoValid) {
      return;
    }
    pushTransaction(
      address,
      memo,
      amountCruzbits,
      passphrase,
      label,
      selectedKeyIndex,
      (data: any) => {
        presentToast({
          message:
            data.error ||
            `Transaction: ${shortenHex(data.transaction_id)} was executed`,
          duration: 5000,
          position: 'bottom',
        });

        if (!data.error) {
          setAddress('');
          setMemo('');
        }
      },
    );
  };

  const [presentModal, dismiss] = useIonModal(AuthorizeTransaction, {
    onDismiss: () => dismiss(),
    onAuthorize: (
      passphrase: string,
      selectedKeyIndex: [number, number],
      amountCruzbits: number,
    ) => {
      execute(passphrase, selectedKeyIndex, amountCruzbits);
      dismiss();
    },
    address,
    memo,
  });

  const {
    publicKeys,
    selectedKeyIndex,
    setSelectedKeyIndex,
    label,
    importAgent,
    deleteAgent,
  } = useAgent();

  const selectedKey = publicKeys[selectedKeyIndex[0]][selectedKeyIndex[1]];

  const [presentActionSheet] = useIonActionSheet();

  const handleActionSheet = ({ data, role }: OverlayEventDetail) => {
    if (data?.['action'] === 'delete') {
      deleteAgent();
    }
  };

  const pendingTransactions = usePendingTransactions(selectedKey);
  const recentTransactions = usePubKeyTransactions(selectedKey).slice(0, 3);
  const selectedKeyBalance = usePublicKeyBalance(selectedKey);

  return (
    <PageShell
      tools={
        !!selectedKey
          ? [
              {
                label: 'action sheet',
                renderIcon: () => (
                  <IonIcon
                    slot="icon-only"
                    ios={ellipsisHorizontal}
                    md={ellipsisVertical}
                  ></IonIcon>
                ),
                action: () =>
                  presentActionSheet({
                    onDidDismiss: ({ detail }) => handleActionSheet(detail),
                    header: 'Actions',
                    buttons: [
                      {
                        text: 'Delete agent',
                        role: 'destructive',
                        data: {
                          action: 'delete',
                        },
                      },
                      {
                        text: 'Cancel',
                        role: 'cancel',
                        data: {
                          action: 'cancel',
                        },
                      },
                    ],
                  }),
              },
            ]
          : []
      }
      renderBody={() => (
        <>
          {!selectedKey ? (
            <SetupAgent importKeys={importAgent} />
          ) : (
            <>
              <section className="ion-padding-top ion-padding-start ion-padding-end">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    <KeyChip value={selectedKey} />
                    {selectedKey && (
                      <Agent
                        hideLabel={true}
                        setSelectedKeyIndex={(key) => {
                          setSelectedKeyIndex(key);
                        }}
                        selectedKeyIndex={selectedKeyIndex}
                        publicKeys={publicKeys}
                      />
                    )}
                  </span>
                </div>
              </section>
              <IonList>
                <IonItem lines="none">
                  <IonInput
                    className={`${isAddressValid && 'ion-valid'} ${
                      isAddressValid === false && 'ion-invalid'
                    } ${isAddressTouched && 'ion-touched'}`}
                    label="Address"
                    labelPlacement="stacked"
                    clearInput={true}
                    errorText="Invalid address"
                    value={
                      address.substring(40) === '000='
                        ? address.replace(/0+=?$/g, '')
                        : address
                    }
                    onIonBlur={() => {
                      if (!new RegExp('[A-Za-z0-9/+]{43}=').test(address)) {
                        setAddress(
                          `${address
                            .replace(/[^A-Za-z0-9/+]/gi, '')
                            .padEnd(43, '0')}=`,
                        );
                      }
                      onBlurAddress();
                    }}
                    onIonInput={(event) =>
                      setAddress(event.target.value?.toString() ?? '')
                    }
                  />
                </IonItem>

                <IonItem lines="none">
                  <IonTextarea
                    className={`${isMemoValid && 'ion-valid'} ${
                      isMemoValid === false && 'ion-invalid'
                    } ${isMemoTouched && 'ion-touched'}`}
                    label="Memo"
                    placeholder=""
                    labelPlacement="stacked"
                    counter={true}
                    maxlength={150}
                    value={memo}
                    onIonBlur={onBlurMemo}
                    onIonInput={(event) => setMemo(event.target.value ?? '')}
                  />
                </IonItem>
              </IonList>
              <IonButton
                disabled={!isAddressValid || !isMemoValid}
                expand="block"
                className="ion-padding ion-no-margin"
                strong={true}
                onClick={() =>
                  presentModal({
                    initialBreakpoint: 0.75,
                    breakpoints: [0, 0.75],
                  })
                }
              >
                Send
              </IonButton>
              <IonItemDivider />
              <IonItem lines="none">
                <IonCard style={{ width: '100%' }}>
                  <IonCardHeader>
                    <IonCardSubtitle>Balance</IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {(selectedKeyBalance / 100000000).toFixed(8)} CRUZ
                  </IonCardContent>
                </IonCard>
              </IonItem>
              {!!pendingTransactions && !!pendingTransactions.length && (
                <TransactionList
                  heading="Pending"
                  transactions={pendingTransactions}
                />
              )}
              {!!recentTransactions.length && (
                <TransactionList
                  heading="Last 3"
                  transactions={recentTransactions}
                />
              )}
            </>
          )}
        </>
      )}
    />
  );
};

export default Send;

const AuthorizeTransaction = ({
  onDismiss,
  onAuthorize,
  address,
  memo,
}: {
  onDismiss: () => void;
  onAuthorize: (
    passphrase: string,
    selectedKeyIndex: [number, number],
    amountCruzbits: number,
  ) => void;
  address: string;
  memo: string;
}) => {
  const {
    value: passphrase,
    onBlur: onBlurPassphrase,
    isValid: isPassphraseValid,
    isTouched: isPassphraseTouched,
    onInputChange: setPassphrase,
  } = useInputValidationProps((input: string) => input.length > 0);

  const { publicKeys, selectedKeyIndex, setSelectedKeyIndex } = useAgent();
  const {
    value: amount,
    onBlur: onBlurAmount,
    isValid: isAmountValid,
    isTouched: isAmountTouched,
    onInputChange: setAmount,
  } = useInputValidationProps((input: string) => Number(input) > 0, '0.01');

  return (
    <div>
      <IonCard>
        <IonCardHeader>
          <IonCardSubtitle>
            Sent by:
            <Agent
              publicKeys={publicKeys}
              selectedKeyIndex={selectedKeyIndex}
              setSelectedKeyIndex={setSelectedKeyIndex}
            />
          </IonCardSubtitle>
          <IonCardSubtitle>Confirm transaction</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonTextarea
            aria-label="memo"
            className="ion-margin-top"
            readonly
            value={memo}
          />
          <IonInput
            className={`${isAmountValid && 'ion-valid'} ${
              isAmountValid === false && 'ion-invalid'
            } ${isAmountTouched && 'ion-touched'}`}
            label="Amount (CRUZ)"
            labelPlacement="stacked"
            type="number"
            min={0.01}
            step="0.01"
            errorText="Amount must be greater than 0"
            value={amount}
            onIonBlur={onBlurAmount}
            onIonInput={(event) => setAmount(event.target.value?.toString() ?? '')}
          />
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly',
            }}
          >
            <KeyChip value={address} />
          </span>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonCardContent>
          <IonInput
            className={`${isPassphraseValid && 'ion-valid'} ${
              isPassphraseValid === false && 'ion-invalid'
            } ${isPassphraseTouched && 'ion-touched'}`}
            label="Enter Passphrase"
            labelPlacement="stacked"
            clearInput={true}
            errorText="Invalid passphrase"
            value={passphrase}
            type="password"
            onIonBlur={onBlurPassphrase}
            onIonInput={(event) =>
              setPassphrase(event.target.value?.toString() ?? '')
            }
          />
          <IonButton
            className="ion-margin-top"
            fill="solid"
            expand="block"
            strong={true}
            disabled={!isPassphraseValid || !isAmountValid}
            onClick={() =>
              onAuthorize(
                passphrase,
                selectedKeyIndex,
                Math.max(
                  MinAmountCruzbits,
                  Math.round(Number(amount || 0) * 100000000),
                ),
              )
            }
          >
            Confirm
          </IonButton>
          <IonButton
            fill="outline"
            expand="block"
            strong={true}
            onClick={() => onDismiss()}
          >
            Cancel
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
};
