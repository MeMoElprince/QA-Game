# Use the Node.js v22.7.0 image as the base
FROM node:22.7.0-alpine
# Install dependencies (openssl, musl)
RUN apk update && apk add --no-cache \
    openssl \
    musl-dev \
    && rm -rf /var/cache/apk/*
# Set the working directory inside the container
WORKDIR /app
# Copy only the package files to install dependencies
COPY package*.json ./
# Install project dependencies
RUN npm ci --force
# Copy the rest of the application files into the container
COPY . .
# Generate Prisma client
RUN npx prisma generate
# Expose port 3000 (default port for NestJS apps)
EXPOSE 3000
# Command to start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
