# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create startup script
COPY <<EOF /app/start.sh
#!/bin/sh
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Starting server..."
node dist/index.js
EOF

RUN chmod +x /app/start.sh

EXPOSE 5001

CMD ["/app/start.sh"]
