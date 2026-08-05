import "@testing-library/jest-dom";

import { server } from "./mocks/server";

// jsdom doesn't implement window.matchMedia at all - needed by the
// shadcn sidebar's useIsMobile hook (hooks/use-mobile.ts), which any test
// rendering <Sidebar>/<SidebarProvider> now pulls in transitively via the
// app shell. Minimal stub: always reports "not matching", which is fine
// for tests (they don't exercise actual responsive breakpoint behavior).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(), // deprecated API, some libraries still call it
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// listen() before all tests, resetHandlers() between tests so a
// server.use() override in one test never leaks into the next, close()
// after all tests to free the socket.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
