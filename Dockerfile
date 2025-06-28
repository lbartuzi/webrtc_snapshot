FROM node:20

# Install required dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    libx11-xcb1 libxtst6 libxrandr2 libasound2 libgtk-3-0 \
    libnss3 libxss1 libxcomposite1 libxdamage1 libxfixes3 \
    libdbus-glib-1-2 libatk-bridge2.0-0 libgbm1 wget ca-certificates \
    fonts-liberation libappindicator3-1 xdg-utils libnspr4 \
 && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /opt/webrtc_snapshot

# Copy files
COPY . .

# Install Node.js dependencies
RUN npm install puppeteer

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
