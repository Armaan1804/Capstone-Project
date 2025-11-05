#!/bin/bash

# MERN Document Search Startup Script

echo "Starting MERN Document Search Application..."

# Check if Docker is available
if command -v docker-compose &> /dev/null; then
    echo "Docker Compose found. Starting with Docker..."
    docker-compose up -d
    echo "Application started with Docker!"
    echo "Frontend: http://localhost:5173"
    echo "Backend API: http://localhost:3000"
    echo "MongoDB: localhost:27017"
    echo "Redis: localhost:6379"
else
    echo "Docker not found. Starting in development mode..."
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        echo "Node.js is required but not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm run install:all
    fi
    
    # Check if MongoDB and Redis are running
    echo "Please ensure MongoDB and Redis are running locally:"
    echo "- MongoDB: mongodb://localhost:27017"
    echo "- Redis: localhost:6379"
    echo ""
    echo "Starting development servers..."
    
    # Start in development mode
    npm run dev
fi