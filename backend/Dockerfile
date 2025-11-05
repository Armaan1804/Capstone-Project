FROM node:18-alpine

WORKDIR /app

# Install system dependencies for Sharp and PDF processing
RUN apk add --no-cache \
    vips-dev \
    poppler-utils \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]