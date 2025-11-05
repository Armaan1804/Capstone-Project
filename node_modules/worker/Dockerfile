FROM node:18-alpine

WORKDIR /app

# Install system dependencies for OCR and image processing
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-eng \
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

# Start the worker
CMD ["npm", "start"]