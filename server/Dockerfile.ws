FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
# Create a non-root user and group
# 'addgroup -S appgroup' creates a system group
# 'adduser -S -G appgroup appuser' creates a system user 'appuser' and adds it to 'appgroup'
RUN addgroup -S appgroup && adduser -S -G appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser


EXPOSE 3003

CMD ["node", "websocket.js"]

