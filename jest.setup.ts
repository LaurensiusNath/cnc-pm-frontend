import "@testing-library/jest-dom";

import { server } from "./mocks/server";

// listen() before all tests, resetHandlers() between tests so a
// server.use() override in one test never leaks into the next, close()
// after all tests to free the socket.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
