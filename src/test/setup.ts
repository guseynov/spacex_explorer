import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

if (!HTMLElement.prototype.scrollBy) {
  Object.defineProperty(HTMLElement.prototype, "scrollBy", {
    configurable: true,
    value(options: ScrollToOptions | number, y?: number) {
      const top = typeof options === "number" ? (y ?? 0) : (options.top ?? 0);
      this.scrollTop += top;
    },
  });
}
