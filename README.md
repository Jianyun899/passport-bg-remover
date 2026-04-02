# Passport Photo Background Remover

Free online tool to remove backgrounds from passport photos and change to white, red, or blue backgrounds.

## Features

- 📤 Upload photos (drag & drop or click)
- ✨ AI-powered background removal
- 🎨 Background color options (white, red, blue, dark blue, transparent, custom)
- 📏 Passport size presets (China, US, UK, EU standards)
- 🔄 Before/After comparison slider
- ⬇️ Download as PNG

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Remove.bg API
- Cloudflare Pages

## Deploy

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://dash.cloudflare.com/sign-up/pages)

### Environment Variables

```env
REMOVE_BG_API_KEY=your_api_key_here
```

Get your API key at: https://www.remove.bg/api

## License

MIT
