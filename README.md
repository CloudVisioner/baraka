# Baraka — Online Bookstore (Backend)

Express + TypeScript backend for Baraka, an online bookstore with a manual payment-approval order flow. Pairs with the [baraka-react](https://github.com/CloudVisioner/baraka-react) frontend.

## Features

- REST API for products, orders, and users
- Manual payment verification workflow (customer uploads payment proof, admin approves/rejects)
- Session-based and JWT authentication
- Real-time updates via Socket.io
- File uploads (payment proof images) via Multer
- Server-rendered admin views (EJS)

## Tech stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, express-session, bcrypt
- **Real-time:** Socket.io
- **File uploads:** Multer
- **Views:** EJS (admin panel)

## Order status flow

PAUSE → PENDING → PROCESS → FINISH
↓
REJECTED (can re-upload)

See [ORDER_DATA_FLOW_EXPLANATION.md](./ORDER_DATA_FLOW_EXPLANATION.md) for full details.

## Setup

```bash
npm install
npm run start:dev
```

Requires a `.env` (not committed) with:
PORT=3003
MONGO_URL=<your MongoDB connection string>
SESSION_SECRET=<random string>
SECRET_TOKEN=<random string>

## Build

```bash
npm run build
npm run start:prod
```

## Related

- Frontend repo: [baraka-react](https://github.com/CloudVisioner/baraka-react)

## Documentation

- [Order status design](./CORRECT_ORDER_STATUS_DESIGN.md)
- [Order approve/reject response](./ORDER_APPROVE_REJECT_RESPONSE.md)
- [Order data flow](./ORDER_DATA_FLOW_EXPLANATION.md)
- [Events API](./EVENTS_API_DOCUMENTATION.md)
