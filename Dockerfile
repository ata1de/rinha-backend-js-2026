FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY resources/ ./resources/
CMD ["node", "--max-old-space-size=120", "src/server.js"]
