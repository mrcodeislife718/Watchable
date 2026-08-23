FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY src ./src
COPY public ./public
COPY config ./config
COPY scripts ./scripts
COPY package.json ./package.json
RUN mkdir -p /app/data
EXPOSE 8787
CMD ["node", "src/server.js"]
