# Development Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database configured (or use existing connection)
- Environment variables configured in `.env`

## Running the Development Server

The application consists of two components that need to run together:

1. **Frontend** (Vite) - runs on port 5000
2. **Backend** (Express) - runs on port 3001

### Single Command (Recommended)

```bash
npm run dev
```

This command uses `concurrently` to run both servers simultaneously:
- Frontend: http://localhost:5000
- Backend: http://localhost:3001

### Separate Terminals (Alternative)

If you prefer to run them separately in different terminals:

**Terminal 1 - Frontend:**
```bash
npm run dev:client
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
```

## First Time Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file):
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

3. Initialize database:
```bash
npm run setup:db
```

4. (Optional) Seed sample data:
```bash
npm run seed:properties
```

5. Start development servers:
```bash
npm run dev
```

## Accessing the Application

- **Frontend**: http://localhost:5000
- **API**: http://localhost:3001/api
- **Backend proxy** (via frontend): http://localhost:5000/api

## Troubleshooting

### Connection Errors: "ECONNREFUSED 127.0.0.1:3001"

This means the backend server is not running. Make sure you're using `npm run dev` which starts both servers, not just `npm run dev:client`.

### Port Already in Use

If port 5000 or 3001 is already in use:

1. Find what's using the port (on Linux/Mac):
```bash
lsof -i :5000  # for frontend
lsof -i :3001  # for backend
```

2. Kill the process:
```bash
kill -9 <PID>
```

Or change the ports in:
- `vite.config.ts` (line 19) for frontend port
- `server/index.ts` (line 30) for backend port

### Database Connection Issues

Make sure your `DATABASE_URL` in `.env` is correct and the database server is running.

## Building for Production

```bash
npm run build
```

Then start with:
```bash
npm run start
```

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start both frontend and backend (recommended) |
| `npm run dev:client` | Start only frontend server |
| `npm run dev:server` | Start only backend server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run setup:db` | Initialize database schema |
| `npm run seed:properties` | Seed sample property data |

## API Documentation

All API endpoints are prefixed with `/api` and located in `server/routes/`:

- **Auth**: `/api/auth/*` - Login, registration, password reset, OTP
- **Properties**: `/api/properties/*` - Property listings and details
- **Admin**: `/api/admin/*` - Admin dashboard endpoints
- **Payments**: `/api/payments/*` - Payment processing
- **Support**: `/api/support/*` - Support tickets
- **Contact**: `/api/contact/*` - Contact form submissions
- **AI Chat**: `/api/ai/*` - AI recommendations and chat
- **Property Chat**: `/api/property-chat/*` - Property inquiry messages

## Development Notes

- The frontend proxy automatically forwards API requests from `/api/*` to `http://localhost:3001/api/*`
- Authentication uses JWT tokens stored in localStorage
- OTP codes are generated for login, registration, and password reset
- "Remember Me" functionality stores encrypted credentials for 30 days
- All timestamps are in UTC

## Contributing

When adding new features:

1. Create API endpoints in `server/routes/`
2. Add corresponding API methods in `src/app/lib/api.ts`
3. Create frontend pages/components as needed
4. Add routes to `src/app/routes.ts`
5. Test both frontend and backend together with `npm run dev`
