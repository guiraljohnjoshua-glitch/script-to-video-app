FROM node:20-bookworm-slim

# Install FFmpeg and fonts using Debian 12 (Bookworm)
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy code and build frontend
COPY . .
RUN npm run build

# Expose port and run server
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
