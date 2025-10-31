FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads logs

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "run", "start:prod"]