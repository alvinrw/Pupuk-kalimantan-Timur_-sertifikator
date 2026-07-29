FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma directory (needed to generate the Prisma Client)
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy the rest of the app code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
