import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppContext } from '../../utils/appContext';
import { MovementControllerPanel } from '.';

vi.mock('@ionic/react', () => ({
  IonButton: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button onClick={onClick} {...props}>{children}</button>,
  IonCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  IonCardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  IonCardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  IonCardSubtitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  IonInput: ({ label, onIonInput, ...props }: { label: string; onIonInput?: (event: CustomEvent<{ value?: string | null }>) => void } & React.InputHTMLAttributes<HTMLInputElement>) => <input aria-label={label} onChange={(event) => onIonInput?.({ detail: { value: event.target.value } } as CustomEvent<{ value?: string | null }>)} {...props} />,
  IonItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  IonLabel: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  IonSegment: ({ children, onIonChange }: { children: React.ReactNode; onIonChange: (event: CustomEvent<{ value?: string }>) => void }) => <div>{React.Children.map(children, (child) => React.isValidElement<{ value: string }>(child) ? React.cloneElement(child, { onClick: () => onIonChange({ detail: { value: child.props.value } } as CustomEvent<{ value?: string }>) }) : child)}</div>,
  IonSegmentButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button>,
  IonText: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  IonTextarea: ({ value, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea value={value} readOnly {...props} />,
  useIonToast: () => [vi.fn()],
}));

vi.mock('../../useCases/useAgent', () => ({
  useAgent: () => ({ selectedKeyIndex: [0, 0], label: 'test-agent' }),
}));

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe('MovementControllerPanel WASD mode', () => {
  it('arms only after Start, releases input focus, and emits movement keys outside editable fields', async () => {
    vi.useFakeTimers();
    const pushTransaction = vi.fn().mockResolvedValue(undefined);

    render(
      <AppContext.Provider value={{ pushTransaction } as never}>
        <MovementControllerPanel plainTextTransaction={<div>Plain text transaction</div>} />
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'WASD' }));
    const passphrase = screen.getByLabelText('Emission passphrase');

    fireEvent.change(passphrase, { target: { value: 'correct horse battery staple' } });
    expect(screen.getByRole('button', { name: 'Start realtime emission' })).toBeEnabled();

    fireEvent.keyDown(window, { key: 'w' });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(pushTransaction).not.toHaveBeenCalled();

    passphrase.focus();
    fireEvent.click(screen.getByRole('button', { name: 'Start realtime emission' }));
    expect(document.activeElement).not.toBe(passphrase);
    expect(screen.getByRole('button', { name: 'Stop realtime emission' })).toBeInTheDocument();

    const speed = screen.getByLabelText('Speed');
    speed.focus();
    fireEvent.keyDown(window, { key: 'w' });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(pushTransaction).not.toHaveBeenCalled();

    speed.blur();
    fireEvent.keyDown(window, { key: 'w' });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(pushTransaction).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Position: 0, 0, -1/)).toBeInTheDocument();
  });
});
