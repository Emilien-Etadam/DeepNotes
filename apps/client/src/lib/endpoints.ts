function wsProtocol(): 'ws:' | 'wss:' {
  return globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:';
}

export const apiUrl = (path = '') =>
  `${globalThis.location.origin}/api/trpc${path}`;

export const apiWsUrl = (path = '') =>
  `${wsProtocol()}//${globalThis.location.host}/api/trpc${path}`;

export const collabUrl = () =>
  `${wsProtocol()}//${globalThis.location.host}/ws/collab`;

export const realtimeUrl = () =>
  `${wsProtocol()}//${globalThis.location.host}/ws/realtime`;
