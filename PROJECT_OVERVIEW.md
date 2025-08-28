# Health Platform - Project Overview

## 🏗️ Architecture Summary

Health Platform is a comprehensive healthcare management system with the following components:

### Backend Services
- **API Server**: Node.js/Express with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io for chat functionality
- **File Storage**: Google Cloud Storage
- **Payment**: Razorpay integration
- **Email**: Resend service

### Frontend Applications
- **Clinics Web**: Next.js 15 with React 19
- **Doctors Web**: Next.js 15 with React 19
- **Admin Web**: Next.js 15 with React 19
- **Clinics Mobile**: React Native with Expo SDK 53
- **Doctors Mobile**: React Native with Expo SDK 53

### Shared Components
- **TypeScript Types**: Common definitions across all platforms
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form with Zod validation

## 📁 Project Structure

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
├── scripts/                # Development and deployment scripts
├── README.md              # Comprehensive documentation
├── PROJECT_OVERVIEW.md    # This file
└── env-template.txt       # Environment variables template
```

## 🚀 Quick Commands

### Development
```bash
# Start all services in development mode
./scripts/dev-start.sh

# Setup project for first time
./scripts/setup.sh

# Start individual services
cd backend && npm run dev
cd clinics-web && npm run dev
cd doctors-web && npm run dev
cd admin && npm run dev
cd clinics-mobile && npm start
cd doctors-mobile && npm start
```

### Production
```bash
# Start all services in production mode
./scripts/prod-start.sh

# Build individual services
cd backend && npm run build && npm start
cd clinics-web && npm run build && npm start
cd doctors-web && npm run build && npm start
cd admin && npm run build && npm start
```

### Database
```bash
# Update database schema
cd backend && npx prisma db push

# Open database GUI
cd backend && npx prisma studio

# Create admin user
cd backend && npm run create-admin
```

## 🌐 Service URLs

| Service | Development | Production |
|---------|-------------|------------|
| Backend API | http://localhost:3001 | https://api.yourapp.com |
| Clinics Web | http://localhost:3000 | https://clinics.yourapp.com |
| Doctors Web | http://localhost:3002 | https://doctors.yourapp.com |
| Admin Web | http://localhost:3003 | https://admin.yourapp.com |
| Mobile Apps | Expo Go (QR codes) | App Store/Play Store |

## 🔧 Key Technologies

### Backend
- **Node.js**: v18+ runtime
- **Express.js**: Web framework
- **TypeScript**: Type safety
- **Prisma**: Database ORM
- **PostgreSQL**: Primary database
- **Socket.io**: Real-time communication
- **JWT**: Authentication
- **bcrypt**: Password hashing

### Frontend
- **Next.js 15**: React framework
- **React 19**: UI library
- **Tailwind CSS 4**: Styling
- **Clerk**: Authentication
- **Zustand**: State management (Admin)
- **React Hook Form**: Form handling
- **Zod**: Validation

### Mobile
- **React Native**: Mobile framework
- **Expo SDK 53**: Development platform
- **NativeWind**: Tailwind for React Native
- **Expo Router**: Navigation
- **React Native Maps**: Map integration

## 📊 Database Schema Overview

### Core Entities
- **Doctor**: Professional profiles with specializations
- **Clinic**: Healthcare facilities with requirements
- **Patient**: Patient records and management
- **Admin**: System administrators
- **JobRequirement**: Job postings by clinics
- **Pitch**: Doctor proposals for jobs
- **Chat**: Real-time messaging system
- **Message**: Individual chat messages
- **News**: Platform announcements
- **Payment**: Transaction records

### Key Relationships
- Doctors can pitch to clinic requirements
- Clinics can accept/reject doctor pitches
- Patients are assigned to clinics and doctors
- Real-time chat between all user types
- Admin manages verification and platform content

## 🔐 Authentication Flow

1. **User Registration**: Email/password or OAuth (Google/Facebook)
2. **Onboarding**: Profile completion and payment
3. **Verification**: Admin approval process
4. **JWT Tokens**: Secure API access
5. **Role-based Access**: Doctor, Clinic, Admin permissions

## 💰 Payment Integration

- **Razorpay**: Payment gateway
- **Onboarding Fees**: One-time registration payment
- **Payment Tracking**: Admin dashboard monitoring
- **Receipt Generation**: Automated payment confirmations

## 📱 Mobile App Features

- **Cross-platform**: iOS, Android, Web
- **Offline Support**: Basic functionality without internet
- **Push Notifications**: Real-time updates
- **Location Services**: GPS-based doctor/clinic discovery
- **File Upload**: Document and image sharing
- **Real-time Chat**: Socket.io integration

## 🛠️ Development Guidelines

### Code Standards
- **File Naming**: kebab-case (e.g., `user-profile.tsx`)
- **Component Naming**: PascalCase (e.g., `UserProfile`)
- **Functional Components**: Always use functional components in React
- **TypeScript**: Strict type checking across all platforms
- **Error Handling**: Try-catch blocks with user-friendly messages

### Database Guidelines
- **Prisma**: Always use `npx prisma db push` for schema changes
- **Migrations**: Use for production deployments
- **Indexes**: Implement for performance optimization
- **Transactions**: Use for multi-table operations

### API Development
- **Consistent Responses**: Use standardized response formats
- **Validation**: Implement Zod schemas for input validation
- **Error Handling**: Graceful error handling with proper HTTP status codes
- **Documentation**: Comment all endpoints and complex logic

## 🔍 Monitoring & Analytics

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

## 🚀 Deployment Strategy

### Web Applications
- **Build Process**: Next.js build optimization
- **Static Assets**: CDN distribution
- **Environment Variables**: Secure configuration management
- **Health Checks**: Automated monitoring

### Mobile Applications
- **EAS Build**: Expo Application Services
- **App Store Deployment**: Automated submission
- **OTA Updates**: Over-the-air updates for minor changes
- **Version Management**: Semantic versioning

### Backend Services
- **Containerization**: Docker deployment
- **Load Balancing**: Multiple instance support
- **Database Migration**: Automated schema updates
- **Backup Strategy**: Regular data backups

## 📞 Support & Troubleshooting

### Common Issues
1. **Port Conflicts**: Check if ports 3000-3003 are available
2. **Database Connection**: Verify PostgreSQL is running
3. **Environment Variables**: Ensure all required vars are set
4. **Dependencies**: Run `npm install` in each project directory

### Debug Commands
```bash
# Check service status
lsof -i :3001  # Check if backend is running

# View logs
tail -f logs/backend-*.log

# Database connection test
cd backend && npx prisma studio

# Mobile app debugging
cd clinics-mobile && npx expo doctor
```

### Performance Optimization
- **Database Indexes**: Optimize query performance
- **Caching**: Implement Redis for frequently accessed data
- **CDN**: Use for static assets
- **Lazy Loading**: Implement for large components
- **Bundle Optimization**: Analyze and optimize bundle sizes

---

**Last Updated**: $(date)
**Version**: 1.0.0 