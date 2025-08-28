# Health Platform - Comprehensive Healthcare Management System

## 🏥 Project Overview

Health Platform is a comprehensive healthcare management system that connects doctors, clinics, and patients through a multi-platform ecosystem. The platform facilitates job matching, patient management, real-time communication, and administrative oversight.

### 🎯 Main Use Cases

#### For Doctors
- **Profile Management**: Create and manage professional profiles with certifications and specializations
- **Job Discovery**: Browse clinic requirements and job opportunities in their area
- **Pitching System**: Submit proposals to clinics for one-time or full-time positions
- **Patient Management**: Handle assigned patients with medical procedures and feedback
- **Real-time Communication**: Chat with clinics and patients through integrated messaging
- **Location-based Search**: Find nearby clinics and opportunities using map interface

#### For Clinics
- **Requirement Posting**: Create job requirements and one-time medical needs
- **Doctor Discovery**: Find qualified doctors based on specialization and location
- **Pitch Management**: Review and accept/reject doctor proposals
- **Patient Management**: Manage patient records, assignments, and status tracking
- **Real-time Communication**: Chat with doctors and manage patient communications
- **Gallery Management**: Showcase clinic facilities and services

#### For Administrators
- **User Verification**: Approve/reject doctor and clinic registrations
- **Payment Management**: Monitor onboarding fees and payment analytics
- **News Management**: Publish and manage platform-wide announcements
- **Analytics Dashboard**: Track platform usage, user growth, and revenue
- **Admin Management**: Create and manage admin users with role-based permissions

## 🏗️ System Architecture

### Multi-Platform Applications
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Doctors Web   │    │  Clinics Web    │    │   Admin Web     │
│   (Next.js)     │    │   (Next.js)     │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │  (Node.js/TS)   │
                    │  (Express.js)   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  PostgreSQL DB  │
                    │   (Prisma ORM)  │
                    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│ Doctors Mobile  │    │ Clinics Mobile  │
│  (React Native) │    │  (React Native) │
│   (Expo SDK)    │    │   (Expo SDK)    │
└─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io for chat functionality
- **File Storage**: Google Cloud Storage
- **Payment**: Razorpay integration
- **Email**: Resend service

#### Web Applications
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk
- **State Management**: Zustand (Admin)
- **Maps**: Google Maps API
- **Charts**: Recharts

#### Mobile Applications
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind for React Native)
- **Maps**: React Native Maps
- **Charts**: React Native Gifted Charts
- **Notifications**: Expo Notifications

#### Shared
- **TypeScript**: Strict type checking across all platforms
- **Shared Types**: Common TypeScript definitions
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form with Zod validation

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (Recommended: v20+)
- **npm**: v9+ or **yarn**: v1.22+
- **PostgreSQL**: v14+ with connection details
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**: For version control

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-platform
   ```

2. **Install dependencies for all projects**
   ```bash
   # Backend
   cd backend && npm install
   
   # Web Applications
   cd ../clinics-web && npm install
   cd ../doctors-web && npm install
   cd ../admin && npm install
   
   # Mobile Applications
   cd ../clinics-mobile && npm install
   cd ../doctors-mobile && npm install
   
   # Shared Types
   cd ../shared-types && npm install
   ```

3. **Database Setup**
   ```bash
   cd backend
   
   # Copy environment template
   cp .env.example .env
   
   # Update database connection in .env
   DATABASE_URL="postgresql://username:password@localhost:5432/health_platform"
   DIRECT_URL="postgresql://username:password@localhost:5432/health_platform"
   
   # Push database schema
   npx prisma db push
   
   # Create initial admin user
   npm run create-admin
   ```

4. **Environment Configuration**
   
   Create `.env.local` files in each project with appropriate configurations:
   
   **Backend (.env)**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/health_platform"
   DIRECT_URL="postgresql://username:password@localhost:5432/health_platform"
   JWT_SECRET="your-super-secret-jwt-key"
   GOOGLE_CLOUD_STORAGE_BUCKET="your-bucket-name"
   GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"
   RAZORPAY_KEY_ID="your-razorpay-key"
   RAZORPAY_KEY_SECRET="your-razorpay-secret"
   RESEND_API_KEY="your-resend-api-key"
   PORT=3001
   ```

   **Web Applications (.env.local)**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
   CLERK_SECRET_KEY=your-clerk-secret
   ```

   **Mobile Applications (.env)**
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3001
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
   ```

### Development Server Startup

#### Option 1: Manual Startup
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Clinics Web
cd clinics-web && npm run dev

# Terminal 3: Doctors Web  
cd doctors-web && npm run dev

# Terminal 4: Admin Web
cd admin && npm run dev

# Terminal 5: Clinics Mobile
cd clinics-mobile && npm start

# Terminal 6: Doctors Mobile
cd doctors-mobile && npm start
```

#### Option 2: Using Bash Scripts (Recommended)
```bash
# Development mode
./scripts/dev-start.sh

# Production mode
./scripts/prod-start.sh
```

### Access URLs
- **Backend API**: http://localhost:3001
- **Clinics Web**: http://localhost:3000
- **Doctors Web**: http://localhost:3002
- **Admin Web**: http://localhost:3003
- **Mobile Apps**: Expo Go app (QR codes from terminal)

## 🛠️ Development Guidelines

### Project Structure
```
health-platform/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controller/     # Route handlers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema and migrations
│   └── scripts/            # Utility scripts
├── clinics-web/            # Clinics web application
├── doctors-web/            # Doctors web application
├── admin/                  # Admin dashboard
├── clinics-mobile/         # Clinics mobile app
├── doctors-mobile/         # Doctors mobile app
├── shared-types/           # Shared TypeScript definitions
└── scripts/                # Development and deployment scripts
```

### Coding Standards

#### File Naming Convention
- **Files**: Use kebab-case (e.g., `user-profile.tsx`, `api-service.ts`)
- **Components**: Use PascalCase (e.g., `UserProfile`, `ApiService`)
- **Directories**: Use kebab-case (e.g., `user-management/`, `api-routes/`)

#### Component Guidelines
- **Always use functional components** in React
- Use TypeScript for all new code
- Implement proper error boundaries
- Use React Hook Form for form handling
- Implement proper loading states

#### API Development
- Use try-catch blocks for all API endpoints
- Implement graceful error handling with user-friendly messages
- Use consistent response formats
- Implement proper validation using Zod schemas
- Use Prisma for database operations with `npx prisma db push`

#### Database Guidelines
- **Always use `npx prisma db push`** for schema changes
- Use migrations for production deployments
- Implement proper indexes for performance
- Use transactions for multi-table operations
- Follow naming conventions (snake_case for database, camelCase for application)

#### Error Handling
- Implement comprehensive error handling with try-catch blocks
- Use toast notifications for user feedback
- Provide fallback UI components
- Log errors appropriately for debugging

### Development Workflow

1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Make changes following coding standards
   # Test thoroughly
   
   # Commit with descriptive messages
   git commit -m "feat: add user profile management"
   
   # Push and create pull request
   git push origin feature/new-feature
   ```

2. **Database Changes**
   ```bash
   # Update Prisma schema
   # Run database push
   npx prisma db push
   
   # Generate Prisma client
   npx prisma generate
   ```

3. **Testing**
   - Test all user flows
   - Verify API endpoints
   - Check mobile app functionality
   - Test admin features

### Common Commands

#### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npx prisma db push   # Update database schema
npx prisma studio    # Open database GUI
npm run create-admin # Create admin user
```

#### Web Applications
```bash
cd clinics-web/doctors-web/admin
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

#### Mobile Applications
```bash
cd clinics-mobile/doctors-mobile
npm start            # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run on web
```

## 🔧 Configuration

### Environment Variables

#### Required for All Projects
- `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL`: Backend API URL
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens

#### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

#### File Storage (Google Cloud)
- `GOOGLE_CLOUD_STORAGE_BUCKET`
- `GOOGLE_APPLICATION_CREDENTIALS`

#### Payment (Razorpay)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

#### Email (Resend)
- `RESEND_API_KEY`

### Database Configuration
- **Host**: localhost (development) / your-db-host (production)
- **Port**: 5432 (default PostgreSQL port)
- **Database**: health_platform
- **SSL**: Required for production deployments

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Web Applications
cd clinics-web/doctors-web/admin
npm run build
npm start
```

### Mobile App Deployment
```bash
# Build for app stores
cd clinics-mobile/doctors-mobile
eas build --platform all
eas submit --platform all
```

## 📱 Mobile App Development

### Expo Development
- Use Expo Go app for development testing
- Implement proper navigation with Expo Router
- Use NativeWind for consistent styling
- Handle platform-specific code appropriately

### Platform-Specific Features
- **iOS**: Implement proper permissions and notifications
- **Android**: Handle back button and navigation
- **Web**: Ensure responsive design and PWA features

## 🔒 Security Considerations

### Authentication
- JWT tokens with proper expiration
- Secure password hashing with bcrypt
- Role-based access control
- Token refresh mechanisms

### API Security
- CORS configuration
- Rate limiting (implement as needed)
- Input validation and sanitization
- SQL injection prevention (Prisma handles this)

### Data Protection
- Encrypt sensitive data
- Implement proper backup strategies
- Follow GDPR compliance guidelines
- Secure file upload handling

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and authentication
- [ ] Profile creation and management
- [ ] Job posting and application flow
- [ ] Chat functionality
- [ ] Payment processing
- [ ] Admin dashboard features
- [ ] Mobile app functionality
- [ ] Cross-platform compatibility

### Automated Testing (Future Enhancement)
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Mobile app testing with Detox

## 📊 Monitoring and Analytics

### Backend Monitoring
- Request logging with timestamps
- Error tracking and alerting
- Performance monitoring
- Database query optimization

### Frontend Monitoring
- User interaction tracking
- Error boundary reporting
- Performance metrics
- User experience analytics

## 🤝 Contributing

### Code Review Process
1. Create feature branch from main
2. Implement changes following coding standards
3. Test thoroughly
4. Create pull request with detailed description
5. Address review comments
6. Merge after approval

### Commit Message Convention
```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 📞 Support and Documentation

### API Documentation
- Backend API endpoints are documented in route files
- Use Postman or similar tools for API testing
- Swagger/OpenAPI documentation (future enhancement)

### Troubleshooting
- Check environment variables
- Verify database connection
- Review application logs
- Test API endpoints independently

### Performance Optimization
- Implement proper caching strategies
- Optimize database queries
- Use CDN for static assets
- Implement lazy loading for components

## 📄 License

This project is proprietary software. All rights reserved.

---

**Note**: This README is a living document. Update it as the project evolves and new features are added. 