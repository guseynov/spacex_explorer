import { EventApiError, retryDelay, shouldRetryRequest } from "./errors";

describe("retry policy", () => {
  it("retries rate limits and server errors twice", () => {
    expect(shouldRetryRequest(0, new EventApiError("rate limit", 429))).toBe(
      true,
    );
    expect(shouldRetryRequest(1, new EventApiError("server", 503))).toBe(
      true,
    );
    expect(shouldRetryRequest(2, new EventApiError("server", 503))).toBe(
      false,
    );
  });

  it("does not retry non-retryable client errors", () => {
    expect(shouldRetryRequest(0, new EventApiError("bad request", 404))).toBe(
      false,
    );
  });

  it("uses the expected backoff schedule", () => {
    expect(retryDelay(0)).toBe(500);
    expect(retryDelay(1)).toBe(1000);
    expect(retryDelay(5)).toBe(1000);
  });
});
