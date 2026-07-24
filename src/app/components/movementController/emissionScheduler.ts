export interface SpatialEmissionSchedulerOptions<T> {
  emit: (draft: T) => Promise<void>;
  minimumIntervalMs: number;
  onError?: (error: unknown) => void;
}

/**
 * Coalesces position updates while preserving the most recent spatial draft.
 * At most one emission is in flight and at most one unsent draft is retained.
 */
export class SpatialEmissionScheduler<T> {
  private active = true;
  private inFlight = false;
  private pending: T | undefined;
  private timer: number | undefined;
  private lastStartedAt = Number.NEGATIVE_INFINITY;
  private minimumIntervalMs: number;

  constructor(private readonly options: SpatialEmissionSchedulerOptions<T>) {
    this.minimumIntervalMs = options.minimumIntervalMs;
  }

  setMinimumInterval(minimumIntervalMs: number) {
    this.minimumIntervalMs = Math.max(0, minimumIntervalMs);
  }

  start() {
    this.active = true;
  }

  submit(draft: T) {
    if (!this.active) return;
    this.pending = draft;
    this.flush();
  }

  stop() {
    this.active = false;
    this.pending = undefined;
    if (this.timer !== undefined) {
      window.clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private flush() {
    if (!this.active || this.inFlight || this.pending === undefined || this.timer !== undefined) return;

    const remainingDelay = this.minimumIntervalMs - (Date.now() - this.lastStartedAt);
    if (remainingDelay > 0) {
      this.timer = window.setTimeout(() => {
        this.timer = undefined;
        this.flush();
      }, remainingDelay);
      return;
    }

    const draft = this.pending;
    this.pending = undefined;
    this.inFlight = true;
    this.lastStartedAt = Date.now();

    void this.options.emit(draft)
      .catch((error: unknown) => this.options.onError?.(error))
      .finally(() => {
        this.inFlight = false;
        this.flush();
      });
  }
}
