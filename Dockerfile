FROM node:20-bullseye-slim

# Install FFmpeg and fonts
RUN apt-get update && apt-get install -y ffmpeg fonts-dejavu && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy project files and build
COPY . .
RUN npm run build

# Expose port and start server
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
