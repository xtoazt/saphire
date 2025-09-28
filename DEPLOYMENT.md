# Saphire Deployment Guide

## Quick Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit: Saphire - AI Web Proxy with HeroUI"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and deploy
   - Saphire is optimized for Vercel with custom configuration

3. **Environment Variables** (Optional - already configured in code):
   - `GOOGLE_API_KEY`: Your Google API key
   - `LLM7_API_KEY`: Your LLM7.io API key
   - `NEXT_PUBLIC_APP_URL`: Your app URL

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Saphire Features

✅ **Web Proxy**: Secure browsing through our proxy service
✅ **AI Integration**: Chat with AI assistant powered by LLM7.io
✅ **Google API**: Enhanced Google services with API key integration
✅ **Beautiful UI**: Modern interface with HeroUI components
✅ **Responsive Design**: Works on desktop and mobile
✅ **Dark Mode**: Beautiful dark theme with toggle
✅ **Vercel Optimized**: Custom configuration for optimal performance

## API Endpoints

- `POST /api/proxy` - Create a proxy URL
- `GET /api/proxy-fetch?url=<url>` - Fetch content through proxy
- `POST /api/chat` - Send message to AI assistant
- `GET /api/chat` - Health check for AI service

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: HeroUI (formerly NextUI)
- **Styling**: Tailwind CSS v4
- **AI Integration**: LLM7.io API
- **Icons**: Lucide React
- **Proxy**: Custom implementation with Google API enhancement

## Security Notes

- API keys are configured in the code for demo purposes
- For production, use environment variables
- Proxy includes security headers and error handling
- AI chat includes rate limiting and error handling
