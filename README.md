# 🏪 My Store — Product Catalog App

A full-stack product catalog application built with **React** (frontend) and **Express + Prisma + MariaDB** (backend), featuring a RESTful API, full CRUD operations, category filtering, pagination, and an AI-powered chat assistant.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database & Data Model](#database--data-model)
- [Backend](#backend)
  - [Key Concepts](#backend-key-concepts)
  - [API Endpoints](#api-endpoints)
  - [Middlewares](#middlewares)
  - [AI Agent](#ai-agent)
- [Frontend](#frontend)
  - [Key Concepts](#frontend-key-concepts)
  - [Pages & Components](#pages--components)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Bootstrap 5 |
| Backend | Node.js, Express 5 |
| ORM | Prisma 7 (MariaDB adapter) |
| Database | MariaDB (MySQL-compatible) |
| AI | LangChain, OpenRouter (free LLM models) |
| Package Manager | pnpm (workspaces) |

---

## Project Structure

```
catalog/
├── backend/
│   ├── AI/
│   │   ├── agents/        # LangChain agents (store, catalogPrompt)
│   │   ├── models/        # OpenRouter LLM setup
│   │   └── tools/         # LangChain tools (e.g. searchProducts)
│   ├── middlewares/       # Express middlewares (validation)
│   ├── prisma/            # Prisma schema & migrations
│   ├── routers/           # Express route handlers
│   ├── prisma-client.js   # Prisma singleton
│   └── server.js          # Express app entry point
├── frontend/
│   ├── components/        # Shared components (ChatWindow)
│   └── src/
│       ├── App.jsx         # Main catalog page
│       ├── ProductDetail.jsx
│       └── main.jsx        # App entry point & routes
└── README.md
```

---

## Database & Data Model

The database uses three tables connected in a **many-to-many** relationship between products and categories, via a join table.

```
Product ──< ProductCategory >── Category
```

```prisma
model Product {
  id          Int               @id @default(autoincrement())
  name        String
  description String
  price       Decimal           @db.Decimal(10, 2)
  image       String?
  categories  ProductCategory[]
}

model Category {
  id       Int               @id @default(autoincrement())
  name     String
  products ProductCategory[]
}

model ProductCategory {
  id         Int      @id @default(autoincrement())
  productId  Int
  product    Product  @relation(...)
  categoryId Int
  category   Category @relation(...)

  @@unique([productId, categoryId])  // no duplicates
}
```

> [!NOTE]
> The join table `ProductCategory` has `onDelete: Cascade`, meaning if a product or category is deleted, its links in the join table are automatically removed.

---

## Backend

### Backend Key Concepts

#### 1. Express Router
Each resource (products, categories, stats, AI) lives in its own **router** file and is mounted on a specific path in `server.js`. This keeps the code organized and modular.

```js
app.use('/products',    productsRouter);
app.use('/categories',  categoriesRouter);
app.use('/stats',       statsRouter);
app.use('/ai',          aiRouter);
```

#### 2. Prisma ORM
Instead of writing raw SQL, **Prisma** lets you query the database using JavaScript objects. It auto-generates a type-safe client from the schema.

```js
// Example: get all products with their categories
const products = await client.product.findMany({
  include: { categories: { select: { category: true } } }
});
```

#### 3. Transactions (`$transaction`)
All **write operations** (create, update, delete) are wrapped in a **transaction**. This guarantees that either *all* operations succeed together, or *none* of them are saved — keeping the database consistent.

```js
await client.$transaction(async (tx) => {
  // delete old category links first
  await tx.productCategory.deleteMany({ where: { productId: id } });
  // then update the product and re-create new links
  await tx.product.update({ ... });
});
```

> [!IMPORTANT]
> Inside a transaction, always use `tx` (the transaction client), **never** `client` directly. Using `client` inside a transaction would bypass the atomic guarantee.

#### 4. Environment Variables & dotenv
Sensitive config (DB credentials, API keys) is stored in `backend/.env` and never committed to git.
To make sure the `.env` is found regardless of which directory you run the server from, we use an **explicit path** based on `import.meta.dirname`:

```js
dotenv.config({ path: path.join(import.meta.dirname, '.env') });
```

#### 5. Global Error Handler
A single error-handling middleware in `server.js` catches any unhandled error thrown in a route and returns a consistent JSON error response — so individual routes don't each need their own try/catch for server errors.

```js
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  res.status(status).json({ success: false, message: '...', data: null });
});
```

---

### API Endpoints

#### Products — `/products`

| Method | Path | Description |
|---|---|---|
| `GET` | `/products` | List products (pagination, search, category filter, maxPrice, sort) |
| `GET` | `/products/:id` | Get a single product by ID |
| `POST` | `/products` | Create a new product |
| `PUT` | `/products/:id` | Update a product (and its category links) |
| `DELETE` | `/products/:id` | Delete a product |

**Query parameters for `GET /products`:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (max 100, default: 10) |
| `search` | string | Filter by product name (partial match) |
| `category` | number | Filter by category ID |
| `maxPrice` | number | Filter products up to this price |
| `sort` | `id` \| `name` \| `price` | Sort field (default: `id`) |
| `order` | `asc` \| `desc` | Sort direction (default: `desc`) |

All responses follow the same shape:
```json
{
  "success": true,
  "message": "",
  "data": { ... },
  "meta": { "page": 1, "limit": 12, "total": 50, "totalPages": 5 }
}
```

#### Categories — `/categories`
| Method | Path | Description |
|---|---|---|
| `GET` | `/categories` | List all categories with product count |

#### Stats — `/stats`
| Method | Path | Description |
|---|---|---|
| `GET` | `/stats` | Aggregate stats (total products, avg price, etc.) |

#### AI Chat — `/ai`
| Method | Path | Description |
|---|---|---|
| `POST` | `/ai/chat` | Send a conversation; get a reply from the AI agent |

---

### Middlewares

Middlewares are functions that run **between the request and the route handler**. They validate input and either block the request with an error or pass it forward with `next()`.

#### `checkProductId`
Checks that `:id` in the URL is a valid positive integer. Responds with `400` if not.

#### `checkProductBody`
Validates and sanitizes the request body for POST/PUT on products:
- `name` → required string
- `description` → optional string
- `price` → required, positive finite number, max 100,000,000
- `image` → optional, must be a valid `http://` or `https://` URL
- `categoryIds` → optional array of valid integer IDs; also **checks in the DB** that each category actually exists

After validation, the clean data is attached to `req.sanitizedData` for the route to use safely.

---

### AI Agent

The AI chat uses **LangChain** to build a ReAct-style agent that can answer questions about the store.

```
User question
     │
     ▼
  AI Agent  ──► (optional) searchProducts tool ──► Prisma query
     │                                                   │
     └───────────────── AI response ◄───────────────────┘
```

- The agent is initialized once (singleton pattern) using `getStoreAgent()`.
- It has a **system prompt** telling it to only answer about My Store products, and to use the `search_products` tool for any product query instead of guessing.
- The conversation history is passed as an array of `{role, content}` objects from the frontend, converted to LangChain `HumanMessage` / `AIMessage` objects.

---

## Frontend

### Frontend Key Concepts

#### 1. React State & Hooks
The app uses **`useState`** to store reactive data (products list, search input, pagination, form values) and **`useEffect`** to trigger side effects (fetching products when the page, search term, or category filter changes).

```js
// Re-fetch products whenever page, search or categoryId changes
useEffect(() => {
  loadProducts();
}, [page, search, categoryId]);
```

#### 2. React Router
Navigation between pages is handled by **React Router** with no full page reloads:

| Path | Component | Description |
|---|---|---|
| `/` | `App` | Main product catalog |
| `/products/:id` | `ProductDetail` | Single product detail page |
| `/chat` | `ChatWindow` | AI assistant chat |

#### 3. Fetch API
All communication with the backend uses the browser's native **Fetch API**. Every response is expected to follow the `{ success, message, data, meta }` shape, and errors are caught and shown as dismissible alerts.

#### 4. Controlled Forms
The add/edit product form is **controlled**: each input's value is driven by React state, and changes go through `handleChange` to update that state. This makes validation and data extraction straightforward.

---

### Pages & Components

#### `App.jsx` — Main Catalog
- Fetches and displays all products in a responsive **4-column grid** (Bootstrap).
- Toolbar with:
  - 🔍 Search by name (submits on form submit)
  - 📂 Category filter dropdown
  - 🔄 Reload button (resets all filters)
  - ➕ Toggle add/edit product panel
- Collapsible **add/edit form** panel (same form for both create and update).
- Each product card shows: thumbnail, price badge, categories, description preview, and View / Edit / Delete buttons.
- **Pagination** with Previous / Next controls.
- Floating 🤖 AI chat button (bottom-right).

#### `ProductDetail.jsx` — Single Product
- Fetches one product by ID from the URL parameter.
- Shows full product info: image, description, categories, price.
- Includes a link to the AI chat to ask questions about the product.

#### `ChatWindow.jsx` — AI Chat
- Full chat UI with message bubbles (user = right/blue, assistant = left/white).
- Sends conversation history to `POST /ai/chat` and appends the reply.
- Starter suggestion chips when the chat is empty.
- Animated typing indicator while waiting for the AI response.
- Clear conversation button and error banner.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- pnpm (`npm install -g pnpm`)
- MariaDB running locally

### Installation

```bash
# Install all dependencies (frontend + backend)
pnpm install
```

### Database Setup

```bash
# Run Prisma migrations to create the tables
cd backend
npx prisma migrate dev
```

### Running the App

```bash
# From the project root — starts both backend and frontend
pnpm all:dev

# Or individually:
pnpm back:dev    # backend only  →  http://localhost:3000
pnpm front:dev   # frontend only →  http://localhost:5173
```

---

## Environment Variables

Create a file at `backend/.env` (never commit this file):

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=catalog

OPENROUTER_API_KEY=your_api_key
```

> [!CAUTION]
> The `.env` file contains secrets. It is listed in `.gitignore` and must never be pushed to a public repository.

