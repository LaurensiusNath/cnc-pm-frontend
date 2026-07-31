/**
 * Jest's jsdom test environment doesn't expose fetch/Request/Response
 * (unlike a real browser or plain Node), which msw/node needs to intercept
 * requests. Loaded via `setupFiles` so these exist before the test
 * environment finishes wiring up - `setupFilesAfterEnv` runs too late.
 *
 * Uses require() instead of import: ES imports are hoisted above the file
 * body, so undici would load (and read globalThis.TextDecoder) before our
 * TextDecoder polyfill below ever ran. require() executes exactly where
 * it's written, so ordering here is guaranteed.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
export {}; // makes this a module so top-level consts don't merge with lib.dom.d.ts globals

const { TextDecoder, TextEncoder } = require("node:util");
const {
  ReadableStream,
  WritableStream,
  TransformStream,
} = require("node:stream/web");
const { Blob, File } = require("node:buffer");
// NOT MessageChannel: only MessagePort's class reference is needed (by
// undici's WebIDL type validation, not to actually instantiate one). If
// MessageChannel is also defined here, React's scheduler package detects
// it and switches to a MessageChannel-based scheduling loop that leaves a
// real Node MessagePort open, hanging Jest after the test run finishes.
const { MessagePort, BroadcastChannel } = require("node:worker_threads");

// configurable: true - @mswjs/interceptors patches Request/fetch/etc. again
// itself once server.listen() runs, so these must stay redefinable.
function define(props: Record<string, unknown>) {
  Object.defineProperties(
    globalThis,
    Object.fromEntries(
      Object.entries(props).map(([key, value]) => [
        key,
        { value, writable: true, configurable: true },
      ]),
    ),
  );
}

define({
  TextDecoder,
  TextEncoder,
  ReadableStream,
  WritableStream,
  TransformStream,
  Blob,
  File,
  MessagePort,
  BroadcastChannel,
});

const { fetch, Headers, FormData, Request, Response } = require("undici");

define({ fetch, Headers, FormData, Request, Response });
