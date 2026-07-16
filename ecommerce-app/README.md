# Trailmark — Basic E-Commerce Demo

A working e-commerce demo built with **Express.js + MongoDB** on the backend and
**plain HTML/CSS/JavaScript** on the frontend. Includes product listings, a
product detail page, shopping cart, user registration/login, and order
processing.

## Features

- Product catalog with search, category filters, and stock status
- Product detail page with quantity selector
- Shopping cart (add / update quantity / remove), persisted per user in MongoDB
- User registration & login (JWT-based auth, passwords hashed with bcrypt)
- Checkout flow that creates an order, decrements stock, and clears the cart
- Order history page
- Simple role field (`customer` / `admin`) with admin-only product & order-status endpoints

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (fetch API) |
| Backend | Node.js, Express.js |
| Database | MongoDB (via Mongoose) |
| Auth | JSON Web Tokens + bcrypt |

The Express server also serves the `frontend/` folder as static files, so the
whole app runs from a single server/port — no separate frontend build step
or CORS setup needed.

## Project Structure

```
ecommerce-app/
├── backend/
│   ├── server.js            # Express app entry point
│   ├── seed.js               # Populates sample products + an admin user
│   ├── config/db.js          # MongoDB connection
│   ├── models/                # Mongoose schemas: User, Product, Cart, Order
│   ├── routes/                 # Express routers
│   ├── controllers/            # Route handlers / business logic
│   ├── middleware/              # JWT auth + admin-only guards
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── index.html            # Product listing / homepage
    ├── product.html           # Product detail page
    ├── cart.html               # Shopping cart
    ├── checkout.html            # Shipping form + place order
    ├── login.html / register.html
    ├── orders.html              # Order history
    ├── css/style.css
    └── js/                       # api.js, auth.js, cart.js + one file per page
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A MongoDB instance — either:
  - **Local:** install MongoDB Community Server and run `mongod`, or
  - **Cloud:** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## Setup

1. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   ```
   MONGO_URI=mongodb://127.0.0.1:27017/trailmark
   JWT_SECRET=some_long_random_string
   PORT=5000
   ```

3. **Seed the database** with sample products and a demo admin account:

   ```bash
   npm run seed
   ```

   This creates 8 sample products and an admin user:
   - Email: `admin@trailmark.test`
   - Password: `admin123`

4. **Start the server**

   ```bash
   npm start
   ```

   Or, for auto-restart on file changes during development:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:5000** in your browser. The frontend and API are
   served from the same origin.

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Log in, receive a JWT |
| GET | `/api/auth/me` | user | Current user profile |
| GET | `/api/products` | — | List products (`?category=`, `?search=`, `?page=`) |
| GET | `/api/products/categories` | — | Distinct category list |
| GET | `/api/products/:id` | — | Product detail |
| POST/PUT/DELETE | `/api/products/:id` | admin | Manage products |
| GET | `/api/cart` | user | Get current cart |
| POST | `/api/cart` | user | Add item `{ productId, quantity }` |
| PUT | `/api/cart/:productId` | user | Update quantity |
| DELETE | `/api/cart/:productId` | user | Remove item |
| POST | `/api/orders` | user | Checkout — creates order from cart |
| GET | `/api/orders` | user | Order history |
| GET | `/api/orders/:id` | user | Order detail |
| PATCH | `/api/orders/:id/status` | admin | Update order status |

Protected routes expect `Authorization: Bearer <token>`.

## Notes & Design Choices

- **No payment gateway is integrated.** Checkout marks orders as `paid`
  immediately for demo purposes. Wire in Stripe/PayPal for a real store.
- **Stock updates use sequential writes, not a MongoDB transaction**, so the
  app works against a standalone `mongod` (transactions require a replica
  set). For a production system processing real payments, wrap the
  stock-decrement + order-create steps in a transaction instead.
- **JWTs are stored in `localStorage`** on the frontend for simplicity. For
  stronger XSS protection in production, consider httpOnly cookies instead.
- **Cart items are per-user in the database**, not per-browser, so a cart
  persists across devices once a user is logged in. There is no guest cart —
  a logged-out visitor is redirected to log in when adding to cart.

## Extending This Project

- Add product images/uploads instead of hardcoded URLs
- Add an admin dashboard UI (the API already supports it)
- Add pagination controls to the product grid
- Integrate a real payment provider
- Add product reviews/ratings
