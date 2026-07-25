import axios from "axios";
import https from "https";
import http from "http";

// Using alternative API endpoints
const API_ENDPOINTS = [
  "https://api.cobalt.tools/api/json",
  "https://co.wuk.sh/api/json"
];

// 1. Connection pooling for high concurrency
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 200, maxFreeSockets: 50, timeout: 60000 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 200, maxFreeSockets: 50, timeout: 60000 });

const apiClient = axios.create({
  httpAgent,
  httpsAgent,
});

// 2. User-Agent Rotation
const UAs = [
  "Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
];

function getRandomUA() {
  return UAs[Math.floor(Math.random() * UAs.length)];
}

// 3. In-memory caching for redundant URL requests
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes cache per URL to survive viral storms

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expiresAt) {
      cache.delete(key);
    }
  }
}, 1000 * 60 * 5); // every 5 minutes

function parseCookie(setCookie: string[] = []) {
  return setCookie.map(v => v.split(";")[0]).join("; ");
}

function parseData(data: any) {
  if (typeof data !== "string") return data;
  const text = data.trim();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function transformCobaltResponse(data: any) {
  // Transform Cobalt API response to our format
  if (!data) return null;
  
  if (data.status === "redirect" || data.status === "stream") {
    return {
      url: data.url,
      filename: data.filename || "media",
      type: "video"
    };
  }
  
  if (data.status === "picker") {
    // Multiple media items (e.g., carousel posts)
    return {
      picker: data.picker.map((item: any) => ({
        url: item.url,
        thumb: item.thumb,
        type: item.type || "image"
      }))
    };
  }
  
  return data;
}

function isOk(status: number, data: any) {
  const isObject = data && typeof data === "object";
  if (status < 200 || status >= 300) return false;
  if (data === null || data === undefined) return false;
  if (data === "") return false;
  if (data === "error") return false;
  if (data === "failed") return false;
  if (data === "user_retry_required") return false;
  if (isObject && data.error === true) return false;
  if (isObject && data.status === false) return false;
  if (isObject && data.status === "error") return false;
  if (isObject && data.status === "rate-limit") return false;
  if (isObject && data.success === false) return false;
  // Cobalt API success check
  if (isObject && data.status === "redirect") return true;
  if (isObject && data.status === "stream") return true;
  if (isObject && data.status === "picker") return true;
  return true;
}

function getError(data: any, status: number) {
  if (typeof data === "string") return data || `HTTP ${status}`;
  if (data && typeof data === "object") return data.message || data.error || data.status || data.reason || `HTTP ${status}`;
  return `HTTP ${status}`;
}

const getHeaders = () => {
  return {
    "accept": "application/json",
    "content-type": "application/json",
    "user-agent": getRandomUA()
  };
};

async function postEndpoint(endpoint: string, url: string) {
  try {
    const payload = {
      url: url,
      vCodec: "h264",
      vQuality: "720",
      aFormat: "mp3",
      filenamePattern: "classic",
      isAudioOnly: false,
      disableMetadata: false
    };

    const res = await apiClient.post(endpoint, payload, {
      timeout: 30000,
      validateStatus: () => true,
      headers: getHeaders()
    });

    return {
      endpoint,
      status: res.status,
      data: res.data
    };
  } catch (err: any) {
    return {
      endpoint,
      status: err.response?.status || 500,
      data: err.response?.data || null
    };
  }
}

async function tryDownload(url: string) {
  // Try first API endpoint
  let result = await postEndpoint(API_ENDPOINTS[0], url);
  
  if (isOk(result.status, result.data)) return result;

  // Try second API endpoint as fallback
  result = await postEndpoint(API_ENDPOINTS[1], url);
  
  return result;
}

// 4. Global promise maps so we don't fetch the exact same URL concurrently
// This prevents overwhelming the server if many people ask for the same video simultaneously
const pendingRequests = new Map<string, Promise<any>>();

export async function downr(url: string) {
  try {
    if (!url || !/^https?:\/\//i.test(url)) {
      throw new Error("Invalid url.");
    }

    // Checking Cache First
    if (cache.has(url)) {
      const cached = cache.get(url)!;
      if (Date.now() < cached.expiresAt) {
        return cached.data;
      } else {
        cache.delete(url);
      }
    }

    // Coalesce duplicate pending requests (Dog-pile prevention)
    if (pendingRequests.has(url)) {
      return await pendingRequests.get(url);
    }

    const requestPromise = (async () => {
      const result = await tryDownload(url);
      const ok = isOk(result.status, result.data);

      const transformedData = ok ? transformCobaltResponse(result.data) : null;

      const finalOutput = {
        Status: ok,
        Code: result.status,
        Input: url,
        Endpoint: result.endpoint,
        Result: transformedData,
        Error: ok ? null : getError(result.data, result.status)
      };

      if (ok) {
         // Save to cache on success
         cache.set(url, {
           data: finalOutput,
           expiresAt: Date.now() + CACHE_TTL_MS
         });
      }

      return finalOutput;
    })();

    pendingRequests.set(url, requestPromise);
    const data = await requestPromise;
    pendingRequests.delete(url);
    return data;
  } catch (err: any) {
    pendingRequests.delete(url);
    return {
      Status: false,
      Code: err.response?.status || 500,
      Input: url || null,
      Endpoint: null,
      Result: null,
      Error: err.message
    };
  }
}
