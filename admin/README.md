# Healthcare Admin Portal

A Next.js admin dashboard for managing the healthcare platform with JWT-based authentication and real-time API integration.

## Features

- **JWT Authentication**: Secure admin login with token-based authentication
- **Dashboard Overview**: Real-time statistics and insights
- **User Management**: Manage doctors and clinics with verification capabilities
- **News Management**: Create, edit, and manage healthcare news and updates
- **Analytics**: Payment and revenue analytics
- **Settings**: Platform configuration and fee management

## Setup

### Prerequisites

- Node.js 18+ 
- Backend API server running on port 3001

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Run the development server:
```bash
npm run dev
```

The admin portal will be available at `http://localhost:3000`

## Default Admin Credentials

For development/demo purposes:
- **Email**: admin@healthcare.com
- **Password**: admin123

> ⚠️ **Important**: Change these credentials in production by updating the backend environment variables:
> - `ADMIN_EMAIL`
> - `ADMIN_PASSWORD`

## API Integration

The admin portal integrates with the following backend API endpoints:

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout

### Dashboard
- `GET /api/admin/get-overview` - Dashboard statistics

### User Management  
- `GET /api/admin/get-all-users` - Get all users (doctors + clinics)
- `GET /api/admin/get-all-doctors` - Get all doctors
- `GET /api/admin/get-all-clinics` - Get all clinics
- `POST /api/admin/verify-doctor/:id` - Verify doctor
- `POST /api/admin/verify-clinic/:id` - Verify clinic

### News Management
- `GET /api/admin/get-all-news` - Get all news articles
- `POST /api/admin/create-news` - Create news article
- `POST /api/admin/update-news/:id` - Update news article
- `POST /api/admin/delete-news/:id` - Delete news article

### Analytics & Settings
- `GET /api/admin/get-all-payments` - Get payment data
- `GET /api/admin/get-onboarding-fee` - Get current fee
- `POST /api/admin/set-onboarding-fee` - Update fee

## Security Features

- **JWT Token Authentication**: Secure API access with JWT tokens
- **Auth Guards**: Route protection for authenticated access only
- **Token Interceptors**: Automatic token injection in API requests
- **Auto Logout**: Automatic logout on token expiration
- **Secure Cookie Storage**: Tokens stored in secure HTTP-only cookies

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component library
- **Zustand**: State management for authentication
- **Axios**: HTTP client with interceptors
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Project Structure

```
admin/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── users/             # User management
│   ├── news/              # News management
│   ├── analytics/         # Analytics dashboard
│   ├── settings/          # Settings page
│   └── page.tsx           # Main dashboard
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── auth-guard.tsx    # Authentication guard
├── lib/                   # Utilities and services
│   ├── api.ts            # API service functions
│   ├── auth-store.ts     # Authentication state management
│   └── axios.ts          # Axios configuration
└── public/               # Static assets
```

## Contributing

1. Follow the existing code structure and patterns
2. Ensure all new features include proper TypeScript types
3. Test authentication flows thoroughly
4. Update this README for any new features

## Security Notes

- All API routes are protected with admin authentication middleware
- JWT tokens expire after 7 days for security
- Sensitive operations require re-authentication
- Environment variables should never be committed to version control