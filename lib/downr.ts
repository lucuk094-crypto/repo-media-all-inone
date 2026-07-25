import axios from "axios";

// API configuration - Multiple endpoints for different platforms
const API_ENDPOINTS = {
  instagram: {
    name: "Nexadev Instagram",
    url: "https://api.nexadev.my.id/api/ig",
    type: "GET",
    platforms: ["instagram"]
  },
  tiktok: {
    name: "Nexadev SnapTik",
    url: "https://api.nexadev.my.id/api/snaptik/",
    type: "GET",
    platforms: ["tiktok"]
  },
  facebook: {
    name: "Nexadev Facebook",
    url: "https://api.nexadev.my.id/api/fb",
    type: "GET",
    platforms: ["facebook"]
  },
  capcut: {
    name: "Nexadev CapCut",
    url: "https://api.nexadev.my.id/api/capcut",
    type: "GET",
    platforms: ["capcut"]
  },
  spotify: {
    name: "Nexadev Spotify",
    url: "https://api.nexadev.my.id/api/spotifyplay",
    type: "GET",
    platforms: ["spotify"]
  },
  tikwm: {
    name: "Tikwm API",
    url: "https://www.tikwm.com/api/",
    type: "POST",
    platforms: ["tiktok"]
  }
};

const DEMO_MODE = process.env.DEMO_MODE === "true";

// Create axios instance with timeout
const apiClient = axios.create({
  timeout: 30000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
});

// Cache configuration
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

// Cleanup old cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expiresAt) {
      cache.delete(key);
    }
  }
}, 1000 * 60 * 5);

// Pending requests map to prevent duplicate requests
const pendingRequests = new Map<string, Promise<any>>();

function getMockResponse(url: string) {
  // Mock response for testing
  return {
    Status: true,
    Code: 200,
    Input: url,
    Endpoint: "DEMO_MODE",
    Result: {
      video_url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
      cover: "https://picsum.photos/400/600",
      title: "Sample Video - Demo Mode",
      author: "Demo User",
      type: "video",
      message: "This is demo mode. Real downloads will work after deployment."
    },
    Error: null
  };
}

function detectPlatform(url: string): string {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes("instagram.com")) return "instagram";
  if (urlLower.includes("tiktok.com") || urlLower.includes("vt.tiktok")) return "tiktok";
  if (urlLower.includes("facebook.com") || urlLower.includes("fb.watch") || urlLower.includes("fb.com")) return "facebook";
  if (urlLower.includes("capcut.com")) return "capcut";
  if (urlLower.includes("spotify.com") || urlLower.includes("open.spotify")) return "spotify";
  if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) return "twitter";
  if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) return "youtube";
  
  return "unknown";
}

function isSpotifySearch(url: string): boolean {
  // Check if it's a Spotify search query (not a URL)
  return !url.startsWith("http") && url.length < 200;
}

function isValidUrl(str: string): boolean {
  try {
    const urlObj = new URL(str);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchFromTikTok(url: string) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.tiktok.url, {
      params: { url },
    });

    if (response.data && response.data.status) {
      return {
        success: true,
        endpoint: API_ENDPOINTS.tiktok.name,
        data: transformNexadevResponse(response.data),
      };
    }

    return {
      success: false,
      endpoint: API_ENDPOINTS.tiktok.name,
      error: response.data?.message || "Failed to fetch TikTok media",
    };
  } catch (error: any) {
    console.error("TikTok API Error:", error.message);
    return {
      success: false,
      endpoint: API_ENDPOINTS.tiktok.name,
      error: error.message || "Network error",
    };
  }
}

async function fetchFromFacebook(url: string) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.facebook.url, {
      params: { url },
    });

    if (response.data && response.data.status) {
      return {
        success: true,
        endpoint: API_ENDPOINTS.facebook.name,
        data: transformNexadevResponse(response.data),
      };
    }

    return {
      success: false,
      endpoint: API_ENDPOINTS.facebook.name,
      error: response.data?.message || "Failed to fetch Facebook media",
    };
  } catch (error: any) {
    console.error("Facebook API Error:", error.message);
    return {
      success: false,
      endpoint: API_ENDPOINTS.facebook.name,
      error: error.message || "Network error",
    };
  }
}

async function fetchFromCapCut(url: string) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.capcut.url, {
      params: { url },
    });

    if (response.data && response.data.status) {
      return {
        success: true,
        endpoint: API_ENDPOINTS.capcut.name,
        data: transformNexadevResponse(response.data),
      };
    }

    return {
      success: false,
      endpoint: API_ENDPOINTS.capcut.name,
      error: response.data?.message || "Failed to fetch CapCut media",
    };
  } catch (error: any) {
    console.error("CapCut API Error:", error.message);
    return {
      success: false,
      endpoint: API_ENDPOINTS.capcut.name,
      error: error.message || "Network error",
    };
  }
}

async function fetchFromSpotify(query: string) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.spotify.url, {
      params: { q: query },
    });

    if (response.data && response.data.status) {
      return {
        success: true,
        endpoint: API_ENDPOINTS.spotify.name,
        data: transformSpotifyResponse(response.data),
      };
    }

    return {
      success: false,
      endpoint: API_ENDPOINTS.spotify.name,
      error: response.data?.message || "Failed to fetch Spotify media",
    };
  } catch (error: any) {
    console.error("Spotify API Error:", error.message);
    return {
      success: false,
      endpoint: API_ENDPOINTS.spotify.name,
      error: error.message || "Network error",
    };
  }
}

async function fetchFromInstagram(url: string) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.instagram.url, {
      params: { url },
    });

    if (response.data && response.data.status) {
      return {
        success: true,
        endpoint: API_ENDPOINTS.instagram.name,
        data: transformNexadevResponse(response.data),
      };
    }

    return {
      success: false,
      endpoint: API_ENDPOINTS.instagram.name,
      error: response.data?.message || "Failed to fetch Instagram media",
    };
  } catch (error: any) {
    console.error("Instagram API Error:", error.message);
    return {
      success: false,
      endpoint: API_ENDPOINTS.instagram.name,
      error: error.message || "Network error",
    };
  }
}

async function fetchFromTikwm(url: string) {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.tikwm.url,
      `url=${encodeURIComponent(url)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }
    );

    if (response.data && response.data.code === 0 && response.data.data) {
      return {
        success: true,
        endpoint: API_ENDPOINTS.tikwm.name,
        data: transformTikwmResponse(response.data.data),
      };
    }

    return {
      success: false,
      endpoint: API_ENDPOINTS.tikwm.name,
      error: response.data?.msg || "Failed to fetch media",
    };
  } catch (error: any) {
    console.error("Tikwm API Error:", error.message);
    return {
      success: false,
      endpoint: API_ENDPOINTS.tikwm.name,
      error: error.message || "Network error",
    };
  }
}

async function fetchFromAPIs(url: string) {
  const platform = detectPlatform(url);
  console.log(`Detected platform: ${platform}`);

  // Instagram
  if (platform === "instagram") {
    return await fetchFromInstagram(url);
  }

  // TikTok
  if (platform === "tiktok") {
    const result = await fetchFromTikTok(url);
    if (result.success) return result;
    
    // Fallback to Tikwm
    const tikwmResult = await fetchFromTikwm(url);
    return tikwmResult;
  }

  // Facebook
  if (platform === "facebook") {
    return await fetchFromFacebook(url);
  }

  // CapCut
  if (platform === "capcut") {
    return await fetchFromCapCut(url);
  }

  // Spotify
  if (platform === "spotify") {
    // Extract track name or use URL
    const query = url.includes("open.spotify") ? url : url;
    return await fetchFromSpotify(query);
  }

  // Unknown platform
  return {
    success: false,
    endpoint: "Unknown",
    error: "Platform not supported. Supported: Instagram, TikTok, Facebook, CapCut, Spotify"
  };
}

function transformSpotifyResponse(data: any) {
  if (!data || !data.data) return data;

  const spotifyData = data.data;

  // Handle Spotify response
  if (spotifyData.preview || spotifyData.download) {
    return {
      audio_url: spotifyData.download || spotifyData.preview,
      preview_url: spotifyData.preview,
      title: spotifyData.title || spotifyData.name,
      artist: spotifyData.artist || spotifyData.artists,
      album: spotifyData.album,
      cover: spotifyData.cover || spotifyData.image,
      duration: spotifyData.duration,
      type: "audio",
      source: "spotify"
    };
  }

  // Handle search results
  if (Array.isArray(spotifyData.tracks) || Array.isArray(spotifyData)) {
    const tracks = spotifyData.tracks || spotifyData;
    return {
      type: "search_results",
      tracks: tracks.slice(0, 5).map((track: any) => ({
        title: track.title || track.name,
        artist: track.artist || track.artists,
        preview_url: track.preview,
        download_url: track.download,
        cover: track.cover || track.image,
        duration: track.duration
      })),
      source: "spotify"
    };
  }

  return spotifyData;
}

function transformNexadevResponse(data: any) {
  if (!data || !data.data) return data;

  const mediaData = data.data;

  // Handle video response
  if (mediaData.medias && Array.isArray(mediaData.medias)) {
    const videos = mediaData.medias.filter((m: any) => m.quality);
    const images = mediaData.medias.filter((m: any) => m.url && !m.quality);

    if (videos.length > 0) {
      return {
        video_url: videos[0].url,
        video_hd: videos.find((v: any) => v.quality === "hd")?.url || videos[0].url,
        video_sd: videos.find((v: any) => v.quality === "sd")?.url,
        thumbnail: mediaData.thumbnail || videos[0].thumbnail,
        title: mediaData.title,
        duration: mediaData.duration,
        type: "video",
        source: "nexadev"
      };
    }

    if (images.length > 0) {
      return {
        images: images.map((img: any) => img.url),
        thumbnail: mediaData.thumbnail,
        title: mediaData.title,
        type: "images",
        source: "nexadev"
      };
    }
  }

  // Direct media object
  if (mediaData.url) {
    return {
      video_url: mediaData.url,
      thumbnail: mediaData.thumbnail,
      title: mediaData.title,
      type: "video",
      source: "nexadev"
    };
  }

  return mediaData;
}

function transformTikwmResponse(data: any) {
  if (!data) return null;

  // Video response
  if (data.play) {
    return {
      video_url: data.play,
      video_hd: data.hdplay || data.play,
      music_url: data.music,
      cover: data.cover,
      origin_cover: data.origin_cover,
      title: data.title,
      author: {
        nickname: data.author?.nickname,
        unique_id: data.author?.unique_id,
        avatar: data.author?.avatar,
      },
      duration: data.duration,
      play_count: data.play_count,
      like_count: data.digg_count,
      comment_count: data.comment_count,
      share_count: data.share_count,
      download_count: data.download_count,
      type: "video",
    };
  }

  // Images response (carousel/slideshow)
  if (data.images && Array.isArray(data.images)) {
    return {
      images: data.images,
      music_url: data.music,
      title: data.title,
      author: {
        nickname: data.author?.nickname,
        unique_id: data.author?.unique_id,
        avatar: data.author?.avatar,
      },
      play_count: data.play_count,
      like_count: data.digg_count,
      comment_count: data.comment_count,
      type: "images",
    };
  }

  return data;
}

export async function downr(url: string) {
  try {
    // Check if it's a Spotify search query
    if (isSpotifySearch(url)) {
      const result = await fetchFromSpotify(url);
      
      if (result.success) {
        return {
          Status: true,
          Code: 200,
          Input: url,
          Endpoint: result.endpoint,
          Result: result.data,
          Error: null,
        };
      } else {
        return {
          Status: false,
          Code: 500,
          Input: url,
          Endpoint: result.endpoint,
          Result: null,
          Error: result.error || "Failed to search Spotify",
        };
      }
    }

    // Validate URL for non-Spotify searches
    if (!url || !isValidUrl(url)) {
      return {
        Status: false,
        Code: 400,
        Input: url || null,
        Endpoint: null,
        Result: null,
        Error: "Invalid URL format. Please provide a valid HTTP/HTTPS URL or Spotify search query.",
      };
    }

    // Check cache first
    if (cache.has(url)) {
      const cached = cache.get(url)!;
      if (Date.now() < cached.expiresAt) {
        return cached.data;
      } else {
        cache.delete(url);
      }
    }

    // Return demo response if in demo mode
    if (DEMO_MODE) {
      return getMockResponse(url);
    }

    // Coalesce duplicate pending requests
    if (pendingRequests.has(url)) {
      return await pendingRequests.get(url);
    }

    const requestPromise = (async () => {
      const result = await fetchFromAPIs(url);

      if (result.success) {
        const finalOutput = {
          Status: true,
          Code: 200,
          Input: url,
          Endpoint: result.endpoint,
          Result: result.data,
          Error: null,
        };

        // Save to cache
        cache.set(url, {
          data: finalOutput,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });

        return finalOutput;
      } else {
        return {
          Status: false,
          Code: 500,
          Input: url,
          Endpoint: result.endpoint,
          Result: null,
          Error: result.error || "Failed to download media. Please try again or use a different URL.",
        };
      }
    })();

    pendingRequests.set(url, requestPromise);
    const data = await requestPromise;
    pendingRequests.delete(url);

    return data;
  } catch (err: any) {
    pendingRequests.delete(url);
    console.error("Download Error:", err);
    return {
      Status: false,
      Code: err.response?.status || 500,
      Input: url || null,
      Endpoint: null,
      Result: null,
      Error: err.message || "An unexpected error occurred",
    };
  }
}
