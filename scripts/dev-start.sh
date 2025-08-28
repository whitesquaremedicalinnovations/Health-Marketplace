#!/bin/bash

# Health Platform Development Startup Script
# This script starts all projects in development mode

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

# Function to start a service
start_service() {
    local service_name=$1
    local port=$2
    local command=$3
    local directory=$4
    
    print_status "Starting $service_name on port $port..."
    
    if check_port $port; then
        print_warning "Port $port is already in use. Skipping $service_name."
        return 1
    fi
    
    # Create a unique log file for each service
    local log_file="logs/${service_name}-$(date +%Y%m%d-%H%M%S).log"
    mkdir -p logs
    
    # Start the service in the background
    cd "$directory" && $command > "../$log_file" 2>&1 &
    local pid=$!
    
    # Store the PID for later cleanup
    echo $pid > "logs/${service_name}.pid"
    
    print_success "$service_name started with PID $pid"
    return 0
}

# Function to cleanup background processes
cleanup() {
    print_status "Cleaning up background processes..."
    
    if [ -d "logs" ]; then
        for pid_file in logs/*.pid; do
            if [ -f "$pid_file" ]; then
                local pid=$(cat "$pid_file")
                local service_name=$(basename "$pid_file" .pid)
                
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

# Main execution
main() {
    echo "🏥 Health Platform Development Startup"
    echo "======================================"
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
    
    # Check if PostgreSQL is running (optional check)
    if command -v pg_isready &> /dev/null; then
        if ! pg_isready -q; then
            print_warning "PostgreSQL might not be running. Please ensure your database is accessible."
        fi
    fi
    
    print_status "Starting all services in development mode..."
    echo ""
    
    # Start services in order of dependency
    
    # 1. Start Backend API (Port 3001)
    start_service "backend" 3001 "npm run dev" "backend"
    if [ $? -eq 0 ]; then
        # Wait for backend to be ready before starting frontend services
        sleep 5
        wait_for_service "http://localhost:3001" "Backend API"
    fi
    
    # 2. Start Web Applications
    start_service "clinics-web" 3000 "npm run dev" "clinics-web"
    start_service "doctors-web" 3002 "npm run dev" "doctors-web"
    start_service "admin" 3003 "npm run dev" "admin"
    
    # 3. Start Mobile Applications (Expo)
    print_status "Starting mobile applications..."
    print_warning "Mobile apps will open in new terminal windows/tabs"
    
    # Start Clinics Mobile
    if command -v osascript &> /dev/null; then
        # macOS - open in new terminal tab
        osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/clinics-mobile\" && npm start"' &
    elif command -v gnome-terminal &> /dev/null; then
        # Linux - open in new terminal
        gnome-terminal -- bash -c "cd '$(pwd)/clinics-mobile' && npm start; exec bash" &
    elif command -v xterm &> /dev/null; then
        # Fallback for Linux
        xterm -e "cd '$(pwd)/clinics-mobile' && npm start; bash" &
    else
        print_warning "Could not open new terminal for mobile apps. Please start manually:"
        print_warning "cd clinics-mobile && npm start"
    fi
    
    # Start Doctors Mobile
    if command -v osascript &> /dev/null; then
        osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'/doctors-mobile\" && npm start"' &
    elif command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd '$(pwd)/doctors-mobile' && npm start; exec bash" &
    elif command -v xterm &> /dev/null; then
        xterm -e "cd '$(pwd)/doctors-mobile' && npm start; bash" &
    else
        print_warning "Could not open new terminal for mobile apps. Please start manually:"
        print_warning "cd doctors-mobile && npm start"
    fi
    
    echo ""
    print_success "All services started successfully!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Backend API:    http://localhost:3001"
    echo "   Clinics Web:    http://localhost:3000"
    echo "   Doctors Web:    http://localhost:3002"
    echo "   Admin Web:      http://localhost:3003"
    echo ""
    echo "📱 Mobile Apps:"
    echo "   Clinics Mobile: Expo Go app (QR code in terminal)"
    echo "   Doctors Mobile: Expo Go app (QR code in terminal)"
    echo ""
    echo "📋 Logs are available in the 'logs' directory"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Keep the script running
    while true; do
        sleep 1
    done
}

# Run the main function
main "$@" 