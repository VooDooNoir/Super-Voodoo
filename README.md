# Print Store - Multi-Phase Platform

## Architecture Overview

Three independent services working together in a print-on-demand storefront powered by intelligent agent routing.

---

## Phase 2: Stripe Checkout + Printful Order Bridge (Backend)

**Path:** `backend/`
**Port:** 3001

Express.js service bridging Stripe Checkout with Printful fulfillment.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/checkout/create` | Create Stripe Checkout session from cart items |
| POST | `/api/webhooks/stripe` | Receive Stripe events, create Printful orders on `checkout.session.completed` |
| GET | `/api/orders/:stripeSessionId` | Get order status (Printful order ID, status) |
| GET | `/api/products` | Proxy Printful sync products |
| GET | `/health` | Health check |

### How It Works

1. Frontend sends cart to `/api/checkout/create`
2. Backend creates Stripe Checkout session with product metadata (Printful variant IDs)
3. User completes payment on Stripe hosted page
4. Stripe webhook fires `checkout.session.completed`
5. Webhook handler creates Printful order with shipping details
6. Order stored locally for reconciliation

### Setup

```bash
cd backend
npm install
cp ../.env.example .env
npm run dev
```

---

## Phase 3: React Storefront Gallery + Cart UI (Frontend)

**Path:** `frontend/`
**Port:** 3000

React storefront (Vite, Zustand for state, React Router) with product gallery, cart, and checkout flow.

### Components

| Component | Description |
|-----------|-------------|
| `ProductGallery` | Grid of products, fetches from backend proxy, falls back to mock data |
| `ProductCard` | Individual product card with add-to-cart |
| `Cart` | Full cart with quantity controls and total |
| `Checkout` | Checkout form, creates Stripe session |
| `OrderSuccess` | Post-payment order status display |
| `RoutingPanel` | Phase 4 integration - model routing UI |

### State Management

Zustand-style context (`CartContext`) with actions: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`.

### Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Phase 4: OpenRouter Multi-Model Routing Service

**Path:** `routing/`
**Port:** 3002

Tier-aware agent routing via OpenRouter API with fallback chains, health monitoring, cost tracking, and rate limiting.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/routing/models` | List all models by tier with health status |
| POST | `/routing/chat` | Send message, auto-routes to best model for user's tier |
| GET | `/routing/usage/:userId/:tier` | Usage statistics and cost tracking |
| GET | `/health` | Service health with model status overview |

### Tiers

| Tier | Default Model | Max Tokens | Rate Limit | Fallback |
|------|--------------|-----------|-----------|----------|
| **Free** | `hermes-3-llama-3.1-8b:free` | 4096 | 10/min | `llama-3-8b:free`, `mistral-7b:free` |
| **Standard** | `hermes-3-llama-3.1-70b` | 8192 | 30/min | `claude-sonnet-3.5`, `hermes-405b` |
| **Premium** | `hermes-3-llama-3.1-405b` | 32768 | 100/min | `o1-preview`, `gemini-2.0-flash` |

### Key Features

- **Automatic Fallback**: If primary model is down/timeout, routes to next in chain
- **Health Monitoring**: Tracks failures per model; marks as degraded (3 fails) or down (5 fails)
- **Cost Tracking**: Per-user hourly and daily spend tracking via in-memory cache
- **Rate Limiting**: Sliding window per user per tier
- **Cost Limits**: Soft caps per tier prevent runaway spend

### Setup

```bash
cd routing
npm install
cp ../.env.example .env
npm run dev
```

---

## Running All Services

```bash
# Terminal 1 - Backend (Phase 2)
cd backend && npm run dev

# Terminal 2 - Frontend (Phase 3)
cd frontend && npm run dev

# Terminal 3 - Routing Service (Phase 4)
cd routing && npm run dev
```
