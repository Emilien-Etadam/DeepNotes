import { afterEach, describe, expect, it } from 'vitest';

import { apiUrl, apiWsUrl, collabUrl, realtimeUrl } from './endpoints';

describe('endpoints', () => {
  const originalLocation = globalThis.location;

  afterEach(() => {
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  function mockLocation(input: {
    protocol: string;
    host: string;
    origin: string;
  }) {
    Object.defineProperty(globalThis, 'location', {
      value: input,
      writable: true,
      configurable: true,
    });
  }

  it('builds HTTP API URLs from window.location.origin', () => {
    mockLocation({
      protocol: 'http:',
      host: 'localhost:60379',
      origin: 'http://localhost:60379',
    });

    expect(apiUrl()).toBe('http://localhost:60379/api/trpc');
    expect(apiUrl('/sessions.login')).toBe(
      'http://localhost:60379/api/trpc/sessions.login',
    );
  });

  it('uses wss for WebSocket URLs when the page is served over HTTPS', () => {
    mockLocation({
      protocol: 'https:',
      host: 'notes.example.com',
      origin: 'https://notes.example.com',
    });

    expect(apiWsUrl('/groups.rotateKeys')).toBe(
      'wss://notes.example.com/api/trpc/groups.rotateKeys',
    );
    expect(collabUrl()).toBe('wss://notes.example.com/ws/collab');
    expect(realtimeUrl()).toBe('wss://notes.example.com/ws/realtime');
  });

  it('uses ws for WebSocket URLs when the page is served over HTTP', () => {
    mockLocation({
      protocol: 'http:',
      host: '127.0.0.1:8080',
      origin: 'http://127.0.0.1:8080',
    });

    expect(collabUrl()).toBe('ws://127.0.0.1:8080/ws/collab');
    expect(realtimeUrl()).toBe('ws://127.0.0.1:8080/ws/realtime');
  });
});
