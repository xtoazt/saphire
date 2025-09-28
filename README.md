# AI Web Proxy

A beautiful, modern web proxy with AI integration built using Next.js, HeroUI, and TypeScript.

## Features

🚀 **Beautiful UI**: Stunning interface built with HeroUI components
🌐 **Web Proxy**: Secure web browsing through our proxy service
🤖 **AI Integration**: Chat with AI assistant powered by LLM7.io
🔧 **Google API**: Enhanced Google services with API key integration
📱 **Responsive**: Works perfectly on desktop and mobile devices
🌙 **Dark Mode**: Beautiful dark theme with toggle support

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: HeroUI (formerly NextUI)
- **Styling**: Tailwind CSS v4
- **AI Integration**: LLM7.io API
- **Proxy**: Custom proxy implementation with Google API enhancement
- **Icons**: HeroUI Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-proxy
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Configuration

The application comes pre-configured with:

- **Google API Key**: `AIzaSyBGb5fGAyC-pRcRU6MUHb__b_vKha71HRE`
- **LLM7.io API Key**: `s5Mrm8q/+LNSSZSsf1I0sL3bbs3zSiAdPlflRRw3tDOb/5siSOo+/I9O/F7yiWA5M7VARTBR01JynN8CweEM5mpJvwXySRr5n8vdwsZQp14YqZ2lpLC81XmUBS59C2FEH/Y6l+4VKvSee6tHsq0=`

## Usage

### Web Proxy

1. Navigate to the "Web Proxy" tab
2. Enter any URL you want to browse
3. Click "Proxy" to generate a secure proxy URL
4. Click "Open Proxy" to browse the site through our proxy

### AI Chat

1. Navigate to the "AI Chat" tab
2. Type your message in the chat input
3. Press Enter or click "Send" to chat with the AI assistant
4. The AI can help with web browsing, content analysis, and general questions

## API Endpoints

- `POST /api/proxy` - Create a proxy URL for a given website
- `GET /api/proxy-fetch?url=<url>` - Fetch content through the proxy
- `POST /api/chat` - Send a message to the AI assistant
- `GET /api/chat` - Health check for AI service

## Features in Detail

### Web Proxy
- Secure browsing through our proxy service
- Google API integration for enhanced Google services
- URL rewriting for seamless navigation
- Error handling with user-friendly messages
- Content type detection and proper headers

### AI Integration
- Powered by LLM7.io API
- Context-aware conversations
- Message history tracking
- Real-time typing indicators
- Error handling and fallbacks

### UI/UX
- Modern gradient backgrounds
- Glassmorphism design elements
- Smooth animations with Framer Motion
- Responsive design for all screen sizes
- Dark mode with toggle support
- Beautiful HeroUI components

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

Create a `.env.local` file for custom configuration:

```env
GOOGLE_API_KEY=your_google_api_key
LLM7_API_KEY=your_llm7_api_key
NEXT_PUBLIC_APP_URL=your_app_url
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Next.js and HeroUI