FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build && mkdir -p /app/var && chown -R node:node /app
USER node
ENV NODE_ENV=production PORT=3000 DB_PATH=/app/var/orders.sqlite
EXPOSE 3000
VOLUME ["/app/var"]
CMD ["npm", "start"]
