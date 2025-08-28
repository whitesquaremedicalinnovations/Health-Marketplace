#!/bin/bash

# Health Platform Production Startup Script
# This script starts all projects in production mode

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url/health" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "$service_name might not be ready yet. Continuing..."
    return 1
}

# Function to build a service
build_service() {
    local service_name=$1
    local directory=$2
    
    print_status "Building $service_name..."
    
    if [ ! -d "$directory" ]; then
        print_error "Directory $directory does not exist"
        return 1
    fi
    
    cd "$directory"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $directory"
        return 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies for $service_name..."
        npm install
    fi
    
    # Build the service
    if npm run build >/dev/null 2>&1; then
        print_success "$service_name built successfully"
        cd ..
        return 0
    else
        print_error "Failed to build $service_name"
        cd ..
        return 1
    fi
}

# Function to start a production service
start_prod_service() {
    local service_name=$1
    local port=$2
    local command=$3
    local directory=$4
    
    print_status "Starting $service_name in production mode on port $port..."
    
    if check_port $port; then
        print_warning "Port $port is already in use. Skipping $service_name."
        return 1
    fi
    
    # Create a unique log file for each service
    local log_file="logs/${service_name}-prod-$(date +%Y%m%d-%H%M%S).log"
    mkdir -p logs
    
    # Start the service in the background
    cd "$directory" && $command > "../$log_file" 2>&1 &
    local pid=$!
    
    # Store the PID for later cleanup
    echo $pid > "logs/${service_name}-prod.pid"
    
    print_success "$service_name started with PID $pid"
    return 0
}

# Function to cleanup background processes
cleanup() {
    print_status "Cleaning up background processes..."
    
    if [ -d "logs" ]; then
        for pid_file in logs/*-prod.pid; do
            if [ -f "$pid_file" ]; then
                local pid=$(cat "$pid_file")
                local service_name=$(basename "$pid_file" -prod.pid)
                
                if kill -0 $pid 2>/dev/null; then
                    print_status "Stopping $service_name (PID: $pid)..."
                    kill $pid
                    wait $pid 2>/dev/null || true
                fi
                
                rm -f "$pid_file"
            fi
        done
    fi
    
    print_success "Cleanup completed"
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM EXIT

# Function to check environment variables
check_env_vars() {
    local missing_vars=()
    
    # Check for required environment variables
    if [ -z "$DATABASE_URL" ]; then
        missing_vars+=("DATABASE_URL")
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        missing_vars+=("JWT_SECRET")
    fi
    
    if [ -z "$NEXT_PUBLIC_API_URL" ] && [ -z "$EXPO_PUBLIC_API_URL" ]; then
        missing_vars+=("NEXT_PUBLIC_API_URL or EXPO_PUBLIC_API_URL")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_error "Please set these environment variables before running in production"
        exit 1
    fi
    
    print_success "Environment variables check passed"
}

# Main execution
main() {
    echo "🏥 Health Platform Production Startup"
    echo "====================================="
    echo ""
    
    # Check if we're in the correct directory
    if [ ! -d "backend" ] || [ ! -d "clinics-web" ] || [ ! -d "doctors-web" ] || [ ! -d "admin" ]; then
        print_error "Please run this script from the health-platform root directory"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18+ first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check environment variables
    check_env_vars
    
    # Check if PostgreSQL is running (optional check)
    if command -v pg_isready &> /dev/null; then
        if ! pg_isready -q; then
            print_warning "PostgreSQL might not be running. Please ensure your database is accessible."
        fi
    fi
    
    print_status "Building all services for production..."
    echo ""
    
    # Build all services first
    build_service "backend" "backend"
    build_service "clinics-web" "clinics-web"
    build_service "doctors-web" "doctors-web"
    build_service "admin" "admin"
    
    echo ""
    print_status "Starting all services in production mode..."
    echo ""
    
    # Start services in order of dependency
    
    # 1. Start Backend API (Port 3001)
    start_prod_service "backend" 3001 "npm start" "backend"
    if [ $? -eq 0 ]; then
        # Wait for backend to be ready before starting frontend services
        sleep 10
        wait_for_service "http://localhost:3001" "Backend API"
    fi
    
    # 2. Start Web Applications
    start_prod_service "clinics-web" 3000 "npm start" "clinics-web"
    start_prod_service "doctors-web" 3002 "npm start" "doctors-web"
    start_prod_service "admin" 3003 "npm start" "admin"
    
    # 3. Mobile applications are typically deployed separately
    print_status "Mobile applications should be deployed separately:"
    print_status "  - Build APK/IPA files using EAS Build"
    print_status "  - Deploy to app stores or distribute directly"
    echo ""
    
    echo ""
    print_success "All production services started successfully!"
    echo ""
    echo "🌐 Production URLs:"
    echo "   Backend API:    http://localhost:3001"
    echo "   Clinics Web:    http://localhost:3000"
    echo "   Doctors Web:    http://localhost:3002"
    echo "   Admin Web:      http://localhost:3003"
    echo ""
    echo "📱 Mobile Apps:"
    echo "   Clinics Mobile: Deploy via EAS Build"
    echo "   Doctors Mobile: Deploy via EAS Build"
    echo ""
    echo "📋 Production logs are available in the 'logs' directory"
    echo ""
    echo "🔧 Production Commands:"
    echo "   Build mobile apps: cd clinics-mobile && eas build --platform all"
    echo "   Submit to stores:  cd clinics-mobile && eas submit --platform all"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Keep the script running
    while true; do
        sleep 1
    done
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --build-only   Only build the applications, don't start them"
    echo "  --start-only   Only start the applications (assumes they're built)"
    echo ""
    echo "Environment Variables Required:"
    echo "  DATABASE_URL              PostgreSQL connection string"
    echo "  JWT_SECRET                Secret key for JWT tokens"
    echo "  NEXT_PUBLIC_API_URL       Backend API URL for web apps"
    echo "  EXPO_PUBLIC_API_URL       Backend API URL for mobile apps"
    echo ""
    echo "Example:"
    echo "  DATABASE_URL=postgresql://user:pass@localhost:5432/db \\"
    echo "  JWT_SECRET=your-secret \\"
    echo "  NEXT_PUBLIC_API_URL=https://api.yourapp.com \\"
    echo "  $0"
}

# Parse command line arguments
BUILD_ONLY=false
START_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --start-only)
            START_ONLY=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Run the main function
main "$@" 