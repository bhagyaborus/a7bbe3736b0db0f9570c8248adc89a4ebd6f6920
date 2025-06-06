# Social Media Automation Agent

A complete social media automation system built with React, Express, PostgreSQL, and OpenAI integration. This application automates LinkedIn content creation through Telegram input with AI-powered generation and approval workflows.

## Features

- **Dashboard**: Real-time monitoring and analytics
- **Telegram Integration**: Webhook-based message processing
- **AI Content Generation**: OpenAI GPT-4o powered content creation
- **Approval Workflow**: Manual review and approval system
- **Database Storage**: PostgreSQL with Drizzle ORM
- **Professional UI**: Modern React interface with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4o API
- **Build Tool**: Vite
- **Deployment**: Replit-ready

## Setup Instructions

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd social-media-agent
npm install
```

### 2. Environment Variables
Create a `.env` file with:
```
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Development
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/posts` - All posts
- `GET /api/posts/status/:status` - Posts by status
- `POST /api/posts` - Create new post
- `PATCH /api/posts/:id` - Update post
- `POST /api/telegram/webhook` - Telegram webhook
- `POST /api/content/generate` - Manual content generation
- `POST /api/workflow/test` - Test workflow

## Telegram Bot Setup

1. Create a bot via @BotFather
2. Set webhook URL to: `https://your-domain.com/api/telegram/webhook`
3. Configure environment variables with bot token and chat ID

## Database Schema

- **users**: User authentication
- **workflows**: Automation workflows
- **posts**: Content posts with status tracking
- **telegram_messages**: Message processing log
- **api_configs**: Service configurations

## Deployment

The application is configured for Replit deployment with automatic scaling and SSL certificates.

## License

Personal use only.