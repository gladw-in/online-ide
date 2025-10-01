import {
  BACKEND_API_URL,
  GENAI_API_URL,
  TEMP_SHARE_API_URL,
} from "./constants.js";

const blocker = `
(() => {
  const blockedHosts = [
    new URL("${BACKEND_API_URL}").hostname,
    new URL("${GENAI_API_URL}").hostname,
    new URL("${TEMP_SHARE_API_URL}").hostname,
  ];

  const isBlocked = (url) => {
    try {
      const parsedUrl = new URL(url, location.href);
      return blockedHosts.includes(parsedUrl.hostname);
    } catch {
      return false;
    }
  };

  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const url = input instanceof Request ? input.url : input;
    if (isBlocked(url)) {
      return Promise.reject(new Error("Failed to fetch"));
    }
    return originalFetch(input, init);
  };

  const OriginalXHR = window.XMLHttpRequest;
  class PatchedXHR extends OriginalXHR {
    open(method, url, ...args) {
      if (isBlocked(url)) {
        throw new Error("Failed to fetch");
      }
      return super.open(method, url, ...args);
    }
  }
  window.XMLHttpRequest = PatchedXHR;

  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = class extends OriginalWebSocket {
    constructor(url, protocols) {
      if (isBlocked(url)) {
        throw new Error("Failed to fetch");
      }
      return new OriginalWebSocket(url, protocols);
    }
  };

  const OriginalEventSource = window.EventSource;
  window.EventSource = class extends OriginalEventSource {
    constructor(url, ...args) {
      if (isBlocked(url)) {
        throw new Error("Failed to fetch");
      }
      return new OriginalEventSource(url, ...args);
    }
  };

  const originalSendBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = function(url, data) {
    if (isBlocked(url)) {
      return false;
    }
    return originalSendBeacon(url, data);
  };
})();`;

export default blocker;
