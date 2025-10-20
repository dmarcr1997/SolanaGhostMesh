FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates && rm -rf /var/lib/apt/lists/*

COPY submitter/package.json ./
RUN npm i --omit=dev

COPY submitter/submitter.mjs ./

ENV LOG_FILE=logs/logs.json
ENV WALLET=/secrets/device.json

CMD ["npm","start"]