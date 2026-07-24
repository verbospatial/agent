import { describe, expect, it, vi } from 'vitest';
import { SpatialEmissionScheduler } from './emissionScheduler';

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('SpatialEmissionScheduler', () => {
  it('coalesces updates to the latest draft while an emission is in flight', async () => {
    let resolveFirst: (() => void) | undefined;
    const emit = vi.fn(() => new Promise<void>((resolve) => { resolveFirst = resolve; }));
    const scheduler = new SpatialEmissionScheduler({ emit, minimumIntervalMs: 0 });

    scheduler.submit('first');
    scheduler.submit('second');
    scheduler.submit('latest');
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenLastCalledWith('first');

    resolveFirst?.();
    await flushPromises();
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenLastCalledWith('latest');
  });

  it('enforces the configured minimum interval between emission starts', async () => {
    vi.useFakeTimers();
    const emit = vi.fn(async () => undefined);
    const scheduler = new SpatialEmissionScheduler({ emit, minimumIntervalMs: 1000 });

    scheduler.submit('first');
    await flushPromises();
    scheduler.submit('second');
    await vi.advanceTimersByTimeAsync(999);
    expect(emit).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(emit).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('drops queued drafts when stopped and can be restarted', async () => {
    vi.useFakeTimers();
    const emit = vi.fn(async () => undefined);
    const scheduler = new SpatialEmissionScheduler({ emit, minimumIntervalMs: 1000 });

    scheduler.submit('first');
    await flushPromises();
    scheduler.submit('discarded');
    scheduler.stop();
    await vi.advanceTimersByTimeAsync(1000);
    expect(emit).toHaveBeenCalledTimes(1);

    scheduler.start();
    scheduler.submit('after-restart');
    await vi.advanceTimersByTimeAsync(1000);
    expect(emit).toHaveBeenLastCalledWith('after-restart');
    vi.useRealTimers();
  });
});
