# Lily Backend

[![CI](https://github.com/lily-protocol/lily-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/lily-protocol/lily-backend/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

Backend service for Lily Protocol, the autonomous agent finance infrastructure for AI agents on Stellar.

This repository is the backend foundation for provisioning agent-facing services, exposing developer APIs, validating requests, and supporting modular protocol features such as wallets, payments, agent identity, and orchestration flows.

## Highlights

- Express backend with strict TypeScript
- Modular feature structure for contributor-friendly development
- Zod-powered environment and request validation
- Security middleware with Helmet, CORS allowlist, and rate limiting
- Structured logging with Pino
- Automated lint, build, and test checks in GitHub Actions
- Docker-ready local and deployment workflow

## Tech Stack

- Node.js 22
- Express 5
- TypeScript
- Zod
- Vitest and Supertest
- Docker
- GitHub Actions

## Quick Start

```bash
npm install
npm run dev
```

The repo already includes a local `.env` for development. If you want to recreate it manually:

```bash
cp .env.example .env
```

The server runs on `http://localhost:4000` by default.

## Available Endpoints

- `GET /`
- `GET /api/v1/health`
- `GET /api/v1/agents`
- `POST /api/v1/agents`
- `POST /api/v1/payments/quote`

## Example API

The sample `agents` module shows contributors how to structure backend features:

- route registration
- request validation with Zod
- typed controllers and responses
- service-layer business logic
- module-local TypeScript types

Example request:

```bash
curl -X POST http://localhost:4000/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Payments Runner",
    "description": "AgentLily responsible for autonomous USDC payment execution.",
    "capabilities": ["payments", "marketplace-purchases"]
  }'
```

Quote requests use `assetCode` for Stellar assets. Use `"XLM"` when quoting the native Stellar asset.

```bash
curl -X POST http://localhost:4000/api/v1/payments/quote \
  -H "Content-Type: application/json" \
  -d '{
    "fromWalletId": "wallet_123",
    "toAddress": "GAAQEAYEAUDAOCAJBIFQYDIOB4IBCEQTCQKRMFYYDENBWHA5DYPSABOV",
    "amount": "25.5000000",
    "assetCode": "XLM"
  }'
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run test
```

## Project Structure

```text
src/
  common/
  config/
  modules/
    agents/
    health/
    payments/
  routes/
  app.ts
  server.ts
tests/
```

## Docker

```bash
docker build -t lily-backend .
docker run --env-file .env -p 4000:4000 lily-backend
```

## Quality Standards

Every contribution is expected to pass:

```bash
npm run lint
npm run build
npm run test
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines and local setup details.
