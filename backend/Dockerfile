FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY prisma ./prisma
RUN apk add --no-cache openssl && npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN ./node_modules/.bin/tsc

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache wget openssl
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY start.sh ./start.sh
RUN chmod +x start.sh
EXPOSE 4000
CMD ["sh", "start.sh"]
