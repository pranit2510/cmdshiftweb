# CmdShift Backend

Backend API server for CmdShift Web - AI-powered code generation platform.

## Features

- Express.js REST API
- CORS configuration for frontend communication
- Environment-based configuration
- Request logging with Morgan
- Error handling middleware
- Code generation endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure your AI service API key in `.env`

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Generate Code
```
POST /api/generate
Content-Type: application/json

{
  "prompt": "Create a React component with a blue button"
}
```

Response:
```json
{
  "success": true,
  "code": "// Generated code here",
  "language": "javascript",
  "framework": "react",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY` - AI service credentials

## Development

The server runs on port 3001 by default to avoid conflicts with the frontend development server.

CORS is configured to accept requests from the frontend URL specified in the environment variables.