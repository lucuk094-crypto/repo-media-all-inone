# Media Downloader - API Information

## Latest Update: Multi-Platform Dedicated APIs

The application now uses **dedicated APIs** for each major platform to ensure maximum compatibility and success rate.

## API Endpoints

### 1. Instagram API
- **URL:** `https://api.nexadev.my.id/api/ig`
- **Method:** GET
- **Platforms:** Instagram (Reels, Posts, Stories, IGTV)
- **Priority:** Primary for Instagram URLs

### 2. TikTok API (SnapTik)
- **URL:** `https://api.nexadev.my.id/api/snaptik/`
- **Method:** GET
- **Platforms:** TikTok videos, images, audio
- **Priority:** Primary for TikTok URLs

### 3. Facebook API
- **URL:** `https://api.nexadev.my.id/api/fb`
- **Method:** GET
- **Platforms:** Facebook videos, posts
- **Priority:** Primary for Facebook URLs

### 4. CapCut API
- **URL:** `https://api.nexadev.my.id/api/capcut`
- **Method:** GET
- **Platforms:** CapCut videos and templates
- **Priority:** Primary for CapCut URLs

### 5. Spotify API
- **URL:** `https://api.nexadev.my.id/api/spotifyplay`
- **Method:** GET
- **Parameters:** `q` (query/search term or URL)
- **Platforms:** Spotify tracks, albums, playlists
- **Special:** Supports text search queries (e.g., "karna kamu")

### 6. Tikwm API (TikTok Fallback)
- **URL:** `https://www.tikwm.com/api/`
- **Method:** POST
- **Platforms:** TikTok only
- **Priority:** Fallback if SnapTik API fails

## Smart Platform Detection

The app automatically detects the platform and routes to the appropriate API:

```
Instagram URL → Instagram API
TikTok URL → SnapTik API → (fallback: Tikwm)
Facebook URL → Facebook API
CapCut URL → CapCut API
Spotify URL/Search → Spotify API
```

## Supported Platforms

### Currently Active:
- **Instagram** - Posts, Reels, Stories, IGTV (Dedicated API)
- **TikTok** - Videos, images, audio (SnapTik API + Tikwm fallback)
- **Facebook** - Videos, posts (Dedicated API)
- **CapCut** - Videos, templates (Dedicated API)
- **Spotify** - Tracks, albums, search (Dedicated API with text search support)

### Platform Detection Features:
- Automatic URL platform detection
- Spotify text search support (e.g., "song name artist")
- Smart fallback system for maximum success rate
- URL validation before processing

## API Request Examples

### Instagram
```
GET https://api.nexadev.my.id/api/ig?url=https://www.instagram.com/reel/ABC123/
```

### TikTok (SnapTik)
```
GET https://api.nexadev.my.id/api/snaptik/?url=https://vt.tiktok.com/ZSXXAnbkc/
```

### Facebook
```
GET https://api.nexadev.my.id/api/fb?url=https://www.facebook.com/video/123456
```

### CapCut
```
GET https://api.nexadev.my.id/api/capcut?url=https://www.capcut.com/tv2/ZSXXSAX2q/
```

### Spotify (Search by text)
```
GET https://api.nexadev.my.id/api/spotifyplay?q=karna%20kamu
```

### Spotify (URL)
```
GET https://api.nexadev.my.id/api/spotifyplay?q=https://open.spotify.com/track/xyz
```

## API Response Formats

### Nexadev APIs (Instagram, TikTok, Facebook, CapCut)
```json
{
  "status": true,
  "data": {
    "medias": [
      {
        "url": "https://direct-video-url.mp4",
        "quality": "hd",
        "thumbnail": "https://thumb.jpg"
      }
    ],
    "title": "Video Title",
    "duration": "60",
    "thumbnail": "https://thumbnail.jpg"
  }
}
```

### Spotify API Response
```json
{
  "status": true,
  "data": {
    "title": "Song Name",
    "artist": "Artist Name",
    "album": "Album Name",
    "preview": "https://preview-url.mp3",
    "download": "https://download-url.mp3",
    "cover": "https://cover-image.jpg",
    "duration": "180000"
  }
}
```

### Tikwm Response (TikTok Fallback)
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "play": "https://video-url.mp4",
    "hdplay": "https://hd-video-url.mp4",
    "music": "https://audio-url.mp3",
    "cover": "https://cover.jpg",
    "title": "Video Title",
    "author": {
      "nickname": "Username",
      "unique_id": "username"
    }
  }
}
```

## Error Handling

The app automatically:
- Routes each platform to its dedicated API
- Falls back to Tikwm for TikTok if SnapTik fails
- Caches successful responses for 10 minutes
- Prevents duplicate concurrent requests
- Validates URLs before processing
- Returns user-friendly error messages
- Handles Spotify text searches separately from URL inputs

## Rate Limiting

- Nexadev APIs have generous rate limits
- Caching mechanism reduces API calls (10-minute TTL)
- Connection pooling optimizes performance
- Request deduplication prevents API spam

## Privacy & Security

- No data is stored on our servers
- Direct media URLs from API providers
- HTTPS encryption for all requests
- No user tracking or analytics
- No authentication required

## API Credits

This application uses:
- **Nexadev APIs** (https://api.nexadev.my.id) - Instagram, TikTok, Facebook, CapCut, Spotify
- **Tikwm API** (https://www.tikwm.com/api/) - TikTok fallback

## Testing

To test locally:
```bash
npm run dev
```

Test with sample URLs:
- **Instagram:** https://www.instagram.com/reel/ABC123/
- **TikTok:** https://vt.tiktok.com/ZSXXAnbkc/
- **Facebook:** https://www.facebook.com/watch/?v=123456
- **CapCut:** https://www.capcut.com/tv2/ZSXXSAX2q/
- **Spotify Search:** Just type "song name" (e.g., "karna kamu")
- **Spotify URL:** https://open.spotify.com/track/xyz

**Note:** Local testing may fail due to network/ISP restrictions. Deploy to Vercel for reliable testing.

## Deployment

The app is deployed on Vercel and will automatically redeploy when you push to GitHub.

**GitHub Repository:** https://github.com/lucuk094-crypto/repo-media-all-inone
