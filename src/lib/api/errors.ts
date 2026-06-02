export class SpaceXApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "SpaceXApiError";
  }
}

export function shouldRetryRequest(
  failureCount: number,
  error: Error,
) {
  if (!(error instanceof SpaceXApiError)) {
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

