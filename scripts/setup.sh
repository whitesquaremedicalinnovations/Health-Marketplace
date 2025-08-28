#!/bin/bash

# Health Platform Setup Script
# This script helps developers set up the project for the first time

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies for a project
install_dependencies() {
    local project_name=$1
    local project_path=$2
    
    print_status "Installing dependencies for $project_name..."
    
    if [ ! -d "$project_path" ]; then
        print_error "Project directory $project_path does not exist"
        return 1
    fi
    
    cd "$project_path"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $project_path"
        cd ..
        return 1
    fi
    
    if npm install; then
        print_success "Dependencies installed for $project_name"
        cd ..
        return 0
    else
        print_error "Failed to install dependencies for $project_name"
        cd ..
        return 1
    fi
}

# Function to create environment file
create_env_file() {
    local project_path=$1
    local env_file_name=$2
    
    if [ ! -d "$project_path" ]; then
        return 1
    fi
    
    cd "$project_path"
    
    if [ ! -f "$env_file_name" ] && [ -f "../env-template.txt" ]; then
        print_status "Creating $env_file_name for $(basename $project_path)..."
        cp ../env-template.txt "$env_file_name"
        print_warning "Please update $env_file_name with your actual configuration values"
    fi
    
    cd ..
}

# Main setup function
main() {
    echo "🏥 Health Platform Setup"
    echo "======================="
    echo ""
    
    # Check if we're in the correct directory
    if [ ! -d "backend" ] || [ ! -d "clinics-web" ] || [ ! -d "doctors-web" ] || [ ! -d "admin" ]; then
        print_error "Please run this script from the health-platform root directory"
        exit 1
    fi
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js v18+ first."
        print_error "Visit: https://nodejs.org/"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version $(node -v) detected. Version 18+ is recommended."
    else
        print_success "Node.js $(node -v) detected"
    fi
    
    if ! command_exists git; then
        print_warning "Git is not installed. Some features may not work properly."
    else
        print_success "Git $(git --version) detected"
    fi
    
    echo ""
    print_status "Installing dependencies for all projects..."
    echo ""
    
    # Install dependencies for all projects
    install_dependencies "Backend" "backend"
    install_dependencies "Clinics Web" "clinics-web"
    install_dependencies "Doctors Web" "doctors-web"
    install_dependencies "Admin" "admin"
    install_dependencies "Clinics Mobile" "clinics-mobile"
    install_dependencies "Doctors Mobile" "doctors-mobile"
    install_dependencies "Shared Types" "shared-types"
    
    echo ""
    print_status "Setting up environment files..."
    echo ""
    
    # Create environment files
    create_env_file "backend" ".env"
    create_env_file "clinics-web" ".env.local"
    create_env_file "doctors-web" ".env.local"
    create_env_file "admin" ".env.local"
    create_env_file "clinics-mobile" ".env"
    create_env_file "doctors-mobile" ".env"
    
    echo ""
    print_status "Setting up database..."
    echo ""
    
    # Check if PostgreSQL is accessible
    if command_exists psql; then
        print_status "PostgreSQL detected. You can now set up your database:"
        echo "  1. Create a database named 'health_platform'"
        echo "  2. Update the DATABASE_URL in backend/.env"
        echo "  3. Run: cd backend && npx prisma db push"
        echo "  4. Run: cd backend && npm run create-admin"
    else
        print_warning "PostgreSQL not detected. Please install PostgreSQL and create a database."
        echo "  Visit: https://www.postgresql.org/download/"
    fi
    
    echo ""
    print_success "Setup completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Configure environment variables in each project's .env file"
    echo "  2. Set up your PostgreSQL database"
    echo "  3. Run database migrations: cd backend && npx prisma db push"
    echo "  4. Create admin user: cd backend && npm run create-admin"
    echo "  5. Start development servers: ./scripts/dev-start.sh"
    echo ""
    echo "📚 Documentation:"
    echo "  - Read README.md for detailed setup instructions"
    echo "  - Check env-template.txt for environment variable examples"
    echo ""
    echo "🚀 Quick Start:"
    echo "  ./scripts/dev-start.sh"
    echo ""
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --deps-only    Only install dependencies, skip environment setup"
    echo "  --env-only     Only set up environment files, skip dependencies"
    echo ""
    echo "This script will:"
    echo "  1. Check prerequisites (Node.js, npm, git)"
    echo "  2. Install dependencies for all projects"
    echo "  3. Create environment files from template"
    echo "  4. Provide next steps for database setup"
    echo ""
}

# Parse command line arguments
DEPS_ONLY=false
ENV_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        --deps-only)
            DEPS_ONLY=true
            shift
            ;;
        --env-only)
            ENV_ONLY=true
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