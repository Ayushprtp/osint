FROM oven/bun:1.2.15-alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

RUN bun next telemetry disable

COPY . .

RUN bun run build

CMD ["bun", "start"]
