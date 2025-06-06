# Deployment Guide

## How to Download and Deploy Your Social Media Agent

### Method 1: GitHub Export (Recommended)

1. In your Replit project, click the Git/Version Control tab
2. Click "Create a Git Repo" 
3. Connect to GitHub and push your project
4. Go to your GitHub repository
5. Click "Code" → "Download ZIP"

### Method 2: Manual Setup

If you want to recreate this project locally:

#### Required Files:
- `package.json` - Dependencies
- `server/` - Backend code
- `client/` - Frontend code  
- `shared/` - Shared types
- `drizzle.config.ts` - Database config
- `vite.config.ts` - Build config
- `tailwind.config.ts` - Styling config

#### Environment Variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=123456789
```

### Method 3: Replit Deployment

1. Click "Deploy" in your Replit project
2. Choose your deployment plan
3. Configure environment variables
4. Your app will be live at: `https://your-project-name.your-username.repl.co`

### Local Development Setup

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Production Deployment Options

1. **Vercel**: Connect GitHub repo, auto-deploy
2. **Netlify**: Drag and drop build folder
3. **Railway**: Connect GitHub, configure database
4. **Heroku**: Git push deployment
5. **DigitalOcean**: App Platform deployment

### Telegram Webhook Setup

After deployment, configure your Telegram bot:

```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-deployed-url.com/api/telegram/webhook"}'
```

Your social media automation agent will then be fully operational.