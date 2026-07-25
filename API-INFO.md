# Media Downloader - API Information

## Problem Fixed

Previously, the application was using `downr.org` API which returned `action_forbidden` error when deployed to Vercel.

## Solution

Switched to **Cobalt Tools API** - a more reliable and open-source media downloader API.

## API Endpoints Used

1. **Primary:** `https://api.cobalt.tools/api/json`
2. **Fallback:** `https://co.wuk.sh/api/json`

## Supported Platforms

The Cobalt API supports downloading from:

- **TikTok** (videos, images, audio)
- **YouTube** (videos, music)
- **Instagram** (posts, reels, stories)
- **Twitter/X** (videos, GIFs)
- **Reddit** (videos, GIFs)
- **Facebook** (videos)
- **Vimeo** (videos)
- **SoundCloud** (audio)
- **Bilibili** (videos)
- **Dailymotion** (videos)
- **Pinterest** (images, videos)
- **Tumblr** (videos, images)
- **And 30+ more platforms**

## API Request Format

```json
{
  "url": "https://www.tiktok.com/@user/video/12345",
  "vCodec": "h264",
  "vQuality": "720",
  "aFormat": "mp3",
  "filenamePattern": "classic",
  "isAudioOnly": false,
  "disableMetadata": false
}
```

## API Response Formats

### Single Media (Video/Image)
```json
{
  "status": "redirect",
  "url": "https://direct-media-url.com/video.mp4",
  "filename": "downloaded_media"
}
```

### Multiple Media (Carousel/Album)
```json
{
  "status": "picker",
  "picker": [
    {
      "url": "https://media-1.jpg",
      "thumb": "https://thumb-1.jpg",
      "type": "image"
    },
    {
      "url": "https://media-2.mp4",
      "thumb": "https://thumb-2.jpg",
      "type": "video"
    }
  ]
}
```

## Error Handling

The app automatically:
- Retries with fallback endpoint if primary fails
- Caches successful responses for 10 minutes
- Prevents duplicate concurrent requests
- Returns user-friendly error messages

## Rate Limiting

- Cobalt API has generous rate limits
- Caching mechanism reduces API calls
- Connection pooling optimizes performance

## Privacy & Security

- No data is stored on our servers
- Direct media URLs from Cobalt API
- HTTPS encryption for all requests
- No user tracking or analytics

## API Credits

This application uses the **Cobalt Tools API** (https://cobalt.tools)
- Open-source project
- Community-driven
- Free to use
- No API key required

## Testing

To test locally:
```bash
npm run dev
```

Then try with URLs from supported platforms like:
- https://www.tiktok.com/@username/video/1234567890
- https://www.instagram.com/p/ABC123/
- https://twitter.com/user/status/1234567890

## Deployment

The app is deployed on Vercel and will automatically redeploy when you push to GitHub.

**GitHub Repository:** https://github.com/lucuk094-crypto/repo-media-all-inone
