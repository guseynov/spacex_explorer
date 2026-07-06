export class EventApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "EventApiError";
  }
}

export function shouldRetryRequest(
  failureCount: number,
  error: Error,
) {
  if (!(error instanceof EventApiError)) {
    return failureCount < 2;
  }

  if (failureCount >= 2) {
    return false;
  }

  return error.status === 429 || error.status >= 500;
}

export function retryDelay(attemptIndex: number) {
  return attemptIndex <= 0 ? 500 : 1000;
}
